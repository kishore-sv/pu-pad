import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pads, revisions } from "@/lib/db/schema";
import { createPadRequestSchema, updatePadRequestSchema } from "@/lib/validation/pad";
import { eq, sql, desc, inArray } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_WORDS, REVISION_HISTORY_LIMIT } from "@/lib/constants";

function getClientIp(req: Request): string {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) {
    return xfwd.split(",")[0]?.trim() ?? "unknown";
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createPadRequestSchema.parse(body);

    if (data.wordCount > MAX_WORDS) {
      return NextResponse.json(
        { error: "Word limit exceeded." },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(`pad_create:${ip}`)) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const [existing] = await db
      .select()
      .from(pads)
      .where(eq(pads.padHash, data.padHash))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Pad already exists." }, { status: 409 });
    }

    let inserted;
    try {
      [inserted] = await db
        .insert(pads)
        .values({
          padHash: data.padHash,
          encryptedContent: data.encryptedContent,
          salt: data.salt,
          iv: data.iv,
          authTag: data.authTag,
          wordCount: data.wordCount,
          isLocked: data.isLocked,
        })
        .returning();
    } catch (e: any) {
      // Check for unique key violation (Postgres code 23505)
      if (e?.code === "23505" || e?.message?.includes("unique constraint")) {
        return NextResponse.json({ error: "Pad already exists." }, { status: 409 });
      }
      throw e;
    }

    return NextResponse.json(
      {
        id: inserted.id,
        padHash: inserted.padHash,
        encryptedContent: inserted.encryptedContent,
        salt: inserted.salt,
        iv: inserted.iv,
        authTag: inserted.authTag,
        wordCount: inserted.wordCount,
        isLocked: inserted.isLocked,
        selfDestructAt: inserted.selfDestructAt?.toISOString() ?? null,
        createdAt: inserted.createdAt.toISOString(),
        updatedAt: inserted.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("pad create error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const data = updatePadRequestSchema.parse(body);

    if (data.wordCount > MAX_WORDS) {
      return NextResponse.json(
        { error: "Word limit exceeded." },
        { status: 400 }
      );
    }

    const padId = data.padId;

    const [current] = await db
      .select()
      .from(pads)
      .where(eq(pads.id, padId))
      .limit(1);

    if (!current) {
      return NextResponse.json({ error: "Pad not found." }, { status: 404 });
    }

    const expected = new Date(data.expectedUpdatedAt);
    if (current.updatedAt.getTime() !== expected.getTime()) {
      return NextResponse.json({ error: "Conflict", code: "CONFLICT" }, { status: 409 });
    }

    await db.insert(revisions).values({
      padId: current.id,
      encryptedContent: current.encryptedContent,
      iv: current.iv,
      authTag: current.authTag,
    });

    const revs = await db
      .select({ id: revisions.id })
      .from(revisions)
      .where(eq(revisions.padId, current.id))
      .orderBy(desc(revisions.createdAt));

    if (revs.length > REVISION_HISTORY_LIMIT) {
      const toDelete = revs.slice(REVISION_HISTORY_LIMIT).map((r) => r.id);
      if (toDelete.length > 0) {
        await db.delete(revisions).where(inArray(revisions.id, toDelete));
      }
    }

    const [updated] = await db
      .update(pads)
      .set({
        encryptedContent: data.encryptedContent,
        iv: data.iv,
        authTag: data.authTag,
        wordCount: data.wordCount,
        isLocked: data.isLocked,
        selfDestructAt: data.selfDestructAt ? new Date(data.selfDestructAt) : null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(pads.id, current.id))
      .returning();

    return NextResponse.json(
      {
        id: updated.id,
        padHash: updated.padHash,
        encryptedContent: updated.encryptedContent,
        salt: updated.salt,
        iv: updated.iv,
        authTag: updated.authTag,
        wordCount: updated.wordCount,
        isLocked: updated.isLocked,
        selfDestructAt: updated.selfDestructAt?.toISOString() ?? null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("pad update error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

