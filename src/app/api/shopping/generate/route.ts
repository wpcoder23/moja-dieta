import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weeklyPlans, shoppingListItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId } = body;
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Get latest plan
  const plans = db.select().from(weeklyPlans).where(eq(weeklyPlans.userId, userId)).all();
  const latest = plans[plans.length - 1];
  if (!latest) return NextResponse.json({ error: "no plan found" }, { status: 404 });

  const planData = JSON.parse(latest.planData);

  // Aggregate all ingredients from all days
  const ingredientMap = new Map<string, { quantity: number; unit: string }>();

  for (const day of planData.days || []) {
    for (const meal of day.meals || []) {
      for (const ing of meal.ingredients || []) {
        const key = ing.name.toLowerCase();
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.quantity += ing.quantity || 0;
        } else {
          ingredientMap.set(key, { quantity: ing.quantity || 0, unit: ing.unit || "" });
        }
      }
    }
  }

  // Clear existing shopping list
  db.delete(shoppingListItems).run();

  // Insert aggregated ingredients
  let count = 0;
  for (const [name, { quantity, unit }] of ingredientMap) {
    const category = guessCategory(name);
    db.insert(shoppingListItems).values({
      weeklyPlanId: latest.id,
      name: capitalize(name),
      quantity: Math.round(quantity * 10) / 10,
      unit,
      store: "any",
      category,
      isChecked: false,
    }).run();
    count++;
  }

  return NextResponse.json({ generated: count, fromPlanId: latest.id });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (/wołow|wieprzow|kurczak|indyk|karkówk|stek|wątróbk|mięs/.test(n)) return "meat";
  if (/łosoś|sardynk|makrel|śledź|ryb/.test(n)) return "fish";
  if (/jaj|mleko|ser|twaróg|mascarpone|jogurt/.test(n)) return "dairy";
  if (/brokuł|kalafior|brukselk|batat|ziemniak|marchew|kapust|cebul|czosnek|papryk|szparag/.test(n)) return "vegetable";
  if (/jagod|malin|truskaw|awokado|banan|kiwi|ananas|mango|owoc/.test(n)) return "fruit";
  if (/oliw|masło|smalec|kokos|chia|lnian|nasion/.test(n)) return "fat";
  if (/kiszon|burak|ogórk/.test(n)) return "fermented";
  if (/kurkum|pieprz|imbir|cynamon|tymian|oregano|pietruszk|czosnek/.test(n)) return "spice";
  return "other";
}
