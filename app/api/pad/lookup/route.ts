import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pads } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { openPadRequestSchema } from "@/lib/validation/pad";
import type { PadOpenResponse } from "@/lib/types/pad";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { padHash } = openPadRequestSchema.parse(body);

    const now = new Date();

    const [pad] = await db
      .select()
      .from(pads)
      .where(eq(pads.padHash, padHash))
      .limit(1);

    if (!pad) {
      const response: PadOpenResponse = { status: "not_found" };
      return NextResponse.json(response, { status: 200 });
    }

    if (pad.selfDestructAt && pad.selfDestructAt < now) {
      await db.delete(pads).where(and(eq(pads.id, pad.id), lt(pads.selfDestructAt, now)));
      const response: PadOpenResponse = { status: "expired" };
      return NextResponse.json(response, { status: 200 });
    }

    const response: PadOpenResponse = {
      status: "found",
      pad: {
        id: pad.id,
        padHash: pad.padHash,
        encryptedContent: pad.encryptedContent,
        salt: pad.salt,
        iv: pad.iv,
        authTag: pad.authTag,
        wordCount: pad.wordCount,
        isLocked: pad.isLocked,
        selfDestructAt: pad.selfDestructAt?.toISOString() ?? null,
        createdAt: pad.createdAt.toISOString(),
        updatedAt: pad.updatedAt.toISOString(),
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("pad lookup error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

