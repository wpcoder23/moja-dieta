import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weightLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const logs = db
    .select()
    .from(weightLogs)
    .where(eq(weightLogs.userId, Number(userId)))
    .orderBy(desc(weightLogs.loggedAt))
    .all();

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, weight, note } = body;
  if (!userId || !weight) {
    return NextResponse.json({ error: "userId and weight required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  const result = db
    .insert(weightLogs)
    .values({ userId, weight, loggedAt: today, note: note || null })
    .run();

  return NextResponse.json({ id: result.lastInsertRowid, userId, weight, loggedAt: today });
}
