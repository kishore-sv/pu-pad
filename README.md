# PU Pad

A privacy-first, zero-knowledge encrypted notes application.

Live: https://pupad.kishore-sv.me/  
GitHub: https://github.com/kishore-sv/pu-pad  

---

## Why PU Pad Exists

Most note applications:
- Require accounts
- Store content in plain text
- Analyze or track user behavior

PU Pad does none of that.

Your notes are encrypted **in your browser** before they ever reach the server.  
The server never sees decrypted content.

Privacy is not a feature toggle here. It is the foundation.

---

## Core Principles

### 1. Zero-Knowledge Architecture

Encryption and decryption happen entirely in the browser.

- The server never sees plaintext.
- The server never has your decryption key.
- The server cannot read your notes — even if compromised.

If you lose your access code, the data is permanently unrecoverable.

That is intentional.

---

### 2. Single Code Access

- No email
- No username
- No password reset
- No recovery system

Your access code = your encryption key.

Lose it, and the notes are gone forever.

There is no backdoor.

---

### 3. No Tracking

- No content analytics
- No behavioral profiling
- No tracking scripts analyzing your notes
- No hidden telemetry on your content

Your notes remain your notes.

---

### 4. Self-Destruct Notes

Notes can:
- Expire automatically
- Permanently delete themselves
- Remove revision history along with them

No residual recovery.

---

## 🛠 Features

- End-to-End Encryption (Client-Side)
- Zero-Knowledge Storage
- Markdown (MD) Support
- Clean Minimal UI
- Expirable Notes
- No Account System
- No Tracking
- Fast & Lightweight

---

## How It Works (High Level)

1. User enters a secret code.
2. A cryptographic key is derived from that code.
3. Notes are encrypted in the browser.
4. Only encrypted ciphertext is sent to the server.
5. Decryption happens locally using the same code.

The backend only stores encrypted blobs.

---

## Security Model

PU Pad guarantees:

- The server cannot decrypt your notes.
- There is no password recovery.
- If you forget your code, your data is unrecoverable.
- If someone gets your code, they can decrypt your notes.

Security depends on:
- The strength of your chosen code
- Your own operational security

This is intentional.

---

## Tech Stack

- Next.js
- TypeScript
- Client-Side Encryption (Web Crypto API)
- Secure Storage Architecture
- Minimal Backend API
- Deployed on Vercel

---

## Development

Clone the repository:

```bash
git clone https://github.com/kishore-sv/pu-pad.git
cd pu-pad
bun install
bun --bun  run dev
```

---

## Live Demo

https://pupad.kishore-sv.me/

---

## Philosophy

Privacy is not a marketing term.

It is either architected into the system —  
or it does not exist.

PU Pad is built with that belief.

---

## Author

Built by [Kishore SV](https://kishore-sv.me)

If you care about privacy-focused tools, consider contributing.

---

## License

MIT License
