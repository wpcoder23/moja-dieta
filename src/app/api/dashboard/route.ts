import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, weightLogs, dailyLogs, supplementDefinitions, supplementLogs, foodScans, activityLogs } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId") || "1");
  const today = getToday();

  // User profile
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

  // Latest weight
  const latestWeight = db
    .select()
    .from(weightLogs)
    .where(eq(weightLogs.userId, userId))
    .orderBy(desc(weightLogs.loggedAt))
    .limit(1)
    .get();

  // Today's daily log (water, calories, etc.)
  const todayLog = db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, today)))
    .get();

  // Today's supplements
  const suppDefs = db
    .select()
    .from(supplementDefinitions)
    .where(eq(supplementDefinitions.userId, userId))
    .all();

  const suppLogs = db
    .select()
    .from(supplementLogs)
    .where(and(eq(supplementLogs.userId, userId), eq(supplementLogs.date, today)))
    .all();

  // Today's food scans
  const todayScans = db
    .select()
    .from(foodScans)
    .where(eq(foodScans.userId, userId))
    .all()
    .filter((s) => s.scannedAt?.startsWith(today));

  // Today's activity
  const todayActivity = db
    .select()
    .from(activityLogs)
    .where(and(eq(activityLogs.userId, userId), eq(activityLogs.date, today)))
    .all();

  // Calculate totals from scans
  const scannedCalories = todayScans.reduce((sum, s) => sum + (s.caloriesEstimated || 0), 0);
  const scannedProtein = todayScans.reduce((sum, s) => sum + (s.protein || 0), 0);
  const scannedFat = todayScans.reduce((sum, s) => sum + (s.fat || 0), 0);
  const scannedCarbs = todayScans.reduce((sum, s) => sum + (s.carbs || 0), 0);

  // Manual log totals
  const logCalories = todayLog?.totalCalories || 0;
  const logProtein = todayLog?.totalProtein || 0;
  const logFat = todayLog?.totalFat || 0;
  const logCarbs = todayLog?.totalCarbs || 0;

  const totalCalories = scannedCalories + logCalories;
  const totalProtein = scannedProtein + logProtein;
  const totalFat = scannedFat + logFat;
  const totalCarbs = scannedCarbs + logCarbs;

  // Activity totals
  const steps = todayActivity.reduce((sum, a) => sum + (a.steps || 0), 0) || (user.avgDailySteps || 0);
  const stepsCalories = todayActivity.reduce((sum, a) => sum + (a.stepsCalories || 0), 0) || (user.avgStepCalories || 0);
  const workoutCalories = todayActivity.reduce((sum, a) => sum + (a.workoutCalories || 0), 0);
  const totalBurned = stepsCalories + workoutCalories;

  // Deficit
  const calorieTarget = user.dailyCalorieTarget || 2000;
  const deficit = calorieTarget - totalCalories + totalBurned;

  // GLP-1 score: count unique GLP-1 categories eaten today
  let glp1Score = 0;
  for (const scan of todayScans) {
    try {
      const response = JSON.parse(scan.aiResponse || "{}");
      if (response.isGlp1Friendly) glp1Score++;
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    user: {
      name: user.name,
      gender: user.gender,
      calorieTarget,
      proteinTarget: user.dailyProteinTarget || 150,
      fatTarget: user.dailyFatTarget || 130,
      carbTarget: user.dailyCarbTarget || 80,
      carbMin: user.dailyCarbMin,
    },
    weight: {
      current: latestWeight?.weight || user.currentWeight,
      target: user.targetWeight,
    },
    today: {
      calories: totalCalories,
      protein: totalProtein,
      fat: totalFat,
      carbs: totalCarbs,
      water: todayLog?.waterMl || 0,
      steps,
      burned: totalBurned,
      deficit,
      glp1Score: Math.min(5, glp1Score),
      antiInflammatoryScore: todayLog?.antiInflammatoryScore || 0,
    },
    supplements: {
      total: suppDefs.length,
      taken: suppLogs.length,
    },
    scansToday: todayScans.length,
  });
}
