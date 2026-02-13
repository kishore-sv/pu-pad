const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_HASH = "SHA-256";
const KEY_LENGTH_BITS = 256;
const AES_GCM = "AES-GCM";
const IV_LENGTH_BYTES = 12; // 96-bit
const AUTH_TAG_LENGTH_BITS = 128;

export type EncryptedPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

export function randomBytes(length: number): Uint8Array {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
}

export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof window === "undefined") {
    // Bun / Node polyfill
    // eslint-disable-next-line no-undef
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  if (typeof window === "undefined") {
    // eslint-disable-next-line no-undef
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(bytes = 16): string {
  return bytesToBase64(randomBytes(bytes));
}

export function generateIv(): string {
  return bytesToBase64(randomBytes(IV_LENGTH_BYTES));
}

async function importPbkdf2KeyFromCode(code: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(code),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
}

export async function deriveAesKeyFromCode(
  code: string,
  saltB64: string
): Promise<CryptoKey> {
  const baseKey = await importPbkdf2KeyFromCode(code);
  const salt = base64ToBytes(saltB64);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKey,
    { name: AES_GCM, length: KEY_LENGTH_BITS },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptString(
  plaintext: string,
  key: CryptoKey,
  ivB64?: string
): Promise<EncryptedPayload> {
  const iv = ivB64 ? base64ToBytes(ivB64) : randomBytes(IV_LENGTH_BYTES);
  const encoded = TEXT_ENCODER.encode(plaintext);

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      {
        name: AES_GCM,
        iv: iv as any,
        tagLength: AUTH_TAG_LENGTH_BITS,
      },
      key,
      encoded
    )
  );

  const tagBytes = encrypted.slice(encrypted.length - AUTH_TAG_LENGTH_BITS / 8);
  const cipherBytes = encrypted.slice(0, encrypted.length - AUTH_TAG_LENGTH_BITS / 8);

  return {
    ciphertext: bytesToBase64(cipherBytes),
    iv: bytesToBase64(iv),
    authTag: bytesToBase64(tagBytes),
  };
}

export async function decryptString(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<string> {
  const cipherBytes = base64ToBytes(payload.ciphertext);
  const tagBytes = base64ToBytes(payload.authTag);
  const iv = base64ToBytes(payload.iv);

  const combined = new Uint8Array(cipherBytes.length + tagBytes.length);
  combined.set(cipherBytes);
  combined.set(tagBytes, cipherBytes.length);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: AES_GCM,
      iv: iv as any,
      tagLength: AUTH_TAG_LENGTH_BITS,
    },
    key,
    combined
  );

  return TEXT_DECODER.decode(decrypted);
}

export async function hashCodeIdentifier(code: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", TEXT_ENCODER.encode(code));
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type DoubleEncryptedPayload = {
  outer: EncryptedPayload;
};

export async function encryptWithOptionalLock(opts: {
  plaintext: string;
  primaryKey: CryptoKey;
  lockKey?: CryptoKey;
}): Promise<{ payload: EncryptedPayload; isLocked: boolean }> {
  if (!opts.lockKey) {
    const payload = await encryptString(opts.plaintext, opts.primaryKey);
    return { payload, isLocked: false };
  }

  const inner = await encryptString(opts.plaintext, opts.primaryKey);
  const innerJson = JSON.stringify(inner);
  const outer = await encryptString(innerJson, opts.lockKey);
  return { payload: outer, isLocked: true };
}

export async function decryptWithOptionalLock(opts: {
  payload: EncryptedPayload;
  primaryKey: CryptoKey;
  isLocked: boolean;
  lockKey?: CryptoKey;
}): Promise<string> {
  if (!opts.isLocked) {
    return decryptString(opts.payload, opts.primaryKey);
  }
  if (!opts.lockKey) {
    throw new Error("Lock code required for locked pad.");
  }
  const innerJson = await decryptString(opts.payload, opts.lockKey);
  const inner: EncryptedPayload = JSON.parse(innerJson);
  return decryptString(inner, opts.primaryKey);
}

