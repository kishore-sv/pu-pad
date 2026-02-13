import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pads, revisions } from "@/lib/db/schema";
import {
  listRevisionsSchema,
  restoreRevisionSchema,
  clearRevisionsSchema,
} from "@/lib/validation/pad";
import { eq, desc, sql } from "drizzle-orm";

type RouteParams = { params: { id: string } };

export async function GET(_req: NextRequest, context: { params: Promise<RouteParams["params"]> }) {
  try {
    const { id: padId } = await context.params;
    listRevisionsSchema.parse({ padId });

    const items = await db
      .select()
      .from(revisions)
      .where(eq(revisions.padId, padId))
      .orderBy(desc(revisions.createdAt));

    return NextResponse.json(
      items.map((r) => ({
        id: r.id,
        padId: r.padId,
        encryptedContent: r.encryptedContent,
        iv: r.iv,
        authTag: r.authTag,
        createdAt: r.createdAt.toISOString(),
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("revisions list error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<RouteParams["params"]> }) {
  try {
    const { id: padId } = await context.params;
    const body = await req.json();
    const data = restoreRevisionSchema.parse({
      padId,
      ...body,
    });

    const [pad] = await db
      .select()
      .from(pads)
      .where(eq(pads.id, data.padId))
      .limit(1);

    if (!pad) {
      return NextResponse.json({ error: "Pad not found." }, { status: 404 });
    }

    const expected = new Date(data.expectedUpdatedAt);
    if (pad.updatedAt.getTime() !== expected.getTime()) {
      return NextResponse.json({ error: "Conflict", code: "CONFLICT" }, { status: 409 });
    }

    const [rev] = await db
      .select()
      .from(revisions)
      .where(eq(revisions.id, data.revisionId))
      .limit(1);

    if (!rev || rev.padId !== pad.id) {
      return NextResponse.json({ error: "Revision not found." }, { status: 404 });
    }

    await db.insert(revisions).values({
      padId: pad.id,
      encryptedContent: pad.encryptedContent,
      iv: pad.iv,
      authTag: pad.authTag,
    });

    const [updated] = await db
      .update(pads)
      .set({
        encryptedContent: rev.encryptedContent,
        iv: rev.iv,
        authTag: rev.authTag,
        updatedAt: sql`NOW()`,
      })
      .where(eq(pads.id, pad.id))
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
    console.error("revision restore error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<RouteParams["params"]> }) {
  try {
    const { id: padId } = await context.params;
    const body = await req.json().catch(() => ({}));
    clearRevisionsSchema.parse({ padId, ...body });

    await db.delete(revisions).where(eq(revisions.padId, padId));
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("revisions clear error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

