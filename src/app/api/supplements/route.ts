import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supplementDefinitions, supplementLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const definitions = db
    .select()
    .from(supplementDefinitions)
    .where(eq(supplementDefinitions.userId, Number(userId)))
    .all();

  const logs = db
    .select()
    .from(supplementLogs)
    .where(
      and(
        eq(supplementLogs.userId, Number(userId)),
        eq(supplementLogs.date, date)
      )
    )
    .all();

  const takenIds = new Set(logs.map((l) => l.supplementId));

  const result = definitions.map((d) => ({
    ...d,
    taken: takenIds.has(d.id),
    logId: logs.find((l) => l.supplementId === d.id)?.id || null,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, supplementId } = body;
  if (!userId || !supplementId) {
    return NextResponse.json({ error: "userId and supplementId required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toISOString();

  const result = db
    .insert(supplementLogs)
    .values({ userId, supplementId, date: today, takenAt: now })
    .run();

  return NextResponse.json({ id: result.lastInsertRowid, taken: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("logId");
  if (!logId) return NextResponse.json({ error: "logId required" }, { status: 400 });

  db.delete(supplementLogs).where(eq(supplementLogs.id, Number(logId))).run();
  return NextResponse.json({ deleted: true });
}
