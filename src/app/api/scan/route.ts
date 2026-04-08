import { NextResponse } from "next/server";
import { scanFood } from "@/lib/ai/food-scanner";
import { db } from "@/lib/db";
import { foodScans } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, userId, mealType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "imageBase64 and mimeType required" }, { status: 400 });
    }

    const result = await scanFood(imageBase64, mimeType);

    // Save to DB
    if (userId) {
      db.insert(foodScans).values({
        userId,
        aiResponse: JSON.stringify(result),
        caloriesEstimated: result.total.calories,
        protein: result.total.protein,
        fat: result.total.fat,
        carbs: result.total.carbs,
        mealType: mealType || "snack",
      }).run();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "AI scan failed", details: String(error) },
      { status: 500 }
    );
  }
}
