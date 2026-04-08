import { NextResponse } from "next/server";
import { generateWeeklyPlan } from "@/lib/ai/meal-planner";
import { db } from "@/lib/db";
import { weeklyPlans, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const plans = db
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.userId, Number(userId)))
    .all();

  // Return latest plan
  const latest = plans[plans.length - 1];
  if (!latest) return NextResponse.json(null);

  return NextResponse.json({
    ...latest,
    planData: JSON.parse(latest.planData),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, isLutealPhase } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const user = db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });

    const plan = await generateWeeklyPlan({
      userName: user.name,
      calorieTarget: user.dailyCalorieTarget || 2000,
      proteinTarget: user.dailyProteinTarget || 150,
      fatTarget: user.dailyFatTarget || 130,
      carbTarget: user.dailyCarbTarget || 80,
      gender: user.gender || "M",
      isLutealPhase,
    });

    // Get Monday of current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = monday.toISOString().split("T")[0];

    const result = db
      .insert(weeklyPlans)
      .values({
        userId,
        weekStart,
        planData: JSON.stringify(plan),
      })
      .run();

    return NextResponse.json({ id: result.lastInsertRowid, ...plan });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Plan generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
