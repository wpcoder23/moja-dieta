import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

// Calorie burn estimates per minute by workout type (rough averages for ~90kg person)
const BURN_RATES: Record<string, number> = {
  silownia: 7,
  bieganie: 11,
  spacer: 4,
  rower: 8,
  plywanie: 9,
  yoga: 3,
  hiit: 12,
  cardio: 8,
  inne: 6,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "1";
  const date = searchParams.get("date") || getToday();

  const logs = db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.userId, Number(userId)), eq(activityLogs.date, date)))
    .all();

  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, steps, stepsCalories, workoutType, workoutDurationMin, source } = body;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const today = getToday();
  let workoutCalories = 0;

  if (workoutType && workoutDurationMin) {
    const rate = BURN_RATES[workoutType] || BURN_RATES.inne;
    workoutCalories = Math.round(rate * workoutDurationMin);
  }

  const result = db
    .insert(activityLogs)
    .values({
      userId,
      date: today,
      steps: steps || null,
      stepsCalories: stepsCalories || null,
      workoutType: workoutType || null,
      workoutDurationMin: workoutDurationMin || null,
      workoutCalories: workoutCalories || null,
      source: source || "manual",
    })
    .run();

  return NextResponse.json({
    id: result.lastInsertRowid,
    workoutCalories,
    date: today,
  });
}
