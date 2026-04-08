import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId") || "1");
  const date = searchParams.get("date") || getToday();

  const log = db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)))
    .get();

  return NextResponse.json(log || { userId, date, totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, waterMl: 0 });
}

// Add manual meal / update daily totals
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, calories, protein, fat, carbs, mealName } = body;

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const today = getToday();
  const existing = db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, today)))
    .get();

  if (existing) {
    const newCal = (existing.totalCalories || 0) + (calories || 0);
    const newPro = (existing.totalProtein || 0) + (protein || 0);
    const newFat = (existing.totalFat || 0) + (fat || 0);
    const newCarbs = (existing.totalCarbs || 0) + (carbs || 0);

    // Append to meals eaten
    const mealsEaten = existing.mealsEaten ? JSON.parse(existing.mealsEaten) : [];
    mealsEaten.push({ name: mealName || "Reczny wpis", calories, protein, fat, carbs, time: new Date().toISOString() });

    db.update(dailyLogs)
      .set({
        totalCalories: newCal,
        totalProtein: newPro,
        totalFat: newFat,
        totalCarbs: newCarbs,
        mealsEaten: JSON.stringify(mealsEaten),
      })
      .where(eq(dailyLogs.id, existing.id))
      .run();

    return NextResponse.json({ totalCalories: newCal, totalProtein: newPro, totalFat: newFat, totalCarbs: newCarbs });
  } else {
    const mealsEaten = [{ name: mealName || "Reczny wpis", calories, protein, fat, carbs, time: new Date().toISOString() }];
    db.insert(dailyLogs)
      .values({
        userId,
        date: today,
        totalCalories: calories || 0,
        totalProtein: protein || 0,
        totalFat: fat || 0,
        totalCarbs: carbs || 0,
        mealsEaten: JSON.stringify(mealsEaten),
      })
      .run();

    return NextResponse.json({ totalCalories: calories, totalProtein: protein, totalFat: fat, totalCarbs: carbs });
  }
}
