import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pads } from "@/lib/db/schema";
import { lt, and, isNotNull } from "drizzle-orm";
import { getEnv } from "@/lib/env";

export async function DELETE(req: Request) {
  try {
    const env = getEnv();

    if (env.CLEANUP_CRON_SECRET) {
      const provided = req.headers.get("x-cron-secret");
      if (!provided || provided !== env.CLEANUP_CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();

    await db
      .delete(pads)
      .where(and(isNotNull(pads.selfDestructAt), lt(pads.selfDestructAt, now)));

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("cleanup error", error);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}

