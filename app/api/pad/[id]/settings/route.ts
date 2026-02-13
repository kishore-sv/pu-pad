import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pads } from "@/lib/db/schema";
import { settingsUpdateSchema } from "@/lib/validation/pad";
import { eq, sql } from "drizzle-orm";

type RouteParams = { params: { id: string } };

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<RouteParams["params"]> }
) {
  try {
    const { id: padId } = await context.params;
    const body = await req.json();
    const data = settingsUpdateSchema.parse({
      padId,
      ...body,
    });

    const [updated] = await db
      .update(pads)
      .set({
        selfDestructAt: data.selfDestructAt ? new Date(data.selfDestructAt) : null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(pads.id, data.padId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Pad not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: updated.id,
        selfDestructAt: updated.selfDestructAt?.toISOString() ?? null,
        updatedAt: updated.updatedAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("settings update error", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

