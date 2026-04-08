import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "1";
  const date = searchParams.get("date") || getToday();

  const log = db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, Number(userId)), eq(dailyLogs.date, date)))
    .get();

  return NextResponse.json({ waterMl: log?.waterMl || 0, date });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, amount } = body;
  if (!userId || !amount) {
    return NextResponse.json({ error: "userId and amount required" }, { status: 400 });
  }

  const today = getToday();
  const existing = db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, today)))
    .get();

  if (existing) {
    const newWater = (existing.waterMl || 0) + amount;
    db.update(dailyLogs)
      .set({ waterMl: newWater })
      .where(eq(dailyLogs.id, existing.id))
      .run();
    return NextResponse.json({ waterMl: newWater });
  } else {
    db.insert(dailyLogs)
      .values({ userId, date: today, waterMl: amount })
      .run();
    return NextResponse.json({ waterMl: amount });
  }
}
