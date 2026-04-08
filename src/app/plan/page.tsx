"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Meal = {
  type: string;
  name: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  prepTimeMin: number;
  eatingOrderHint: string;
  tags: string[];
};

type DayPlan = {
  day: string;
  meals: Meal[];
};

type PlanData = {
  days: DayPlan[];
};

const DAYS_SHORT = ["Pon", "Wt", "Sr", "Czw", "Pt", "Sob", "Nd"];

const TAG_COLORS: Record<string, string> = {
  "GLP-1": "bg-green-100 text-green-700",
  "Przeciwzapalny": "bg-blue-100 text-blue-700",
  "T-boost": "bg-purple-100 text-purple-700",
  "Hormony": "bg-pink-100 text-pink-700",
  "Omega-3": "bg-cyan-100 text-cyan-700",
  "Folian": "bg-yellow-100 text-yellow-700",
  "Fermented": "bg-orange-100 text-orange-700",
  "Bone-broth": "bg-amber-100 text-amber-700",
};

export default function PlanPage() {
  const [userId, setUserId] = useState(1);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  const fetchPlan = useCallback(async () => {
    const res = await fetch(`/api/plan?userId=${userId}`);
    const data = await res.json();
    if (data?.planData) {
      setPlan(data.planData);
    } else if (data?.days) {
      setPlan(data);
    } else {
      setPlan(null);
    }
  }, [userId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data?.days) {
        setPlan(data);
      } else if (data?.planData) {
        setPlan(typeof data.planData === "string" ? JSON.parse(data.planData) : data.planData);
      }
    } catch (err) {
      console.error("Plan generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  const dayPlan = plan?.days?.[selectedDay];
  const dayTotals = dayPlan?.meals?.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      fat: acc.fat + (m.fat || 0),
      carbs: acc.carbs + (m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plan posilkow</h1>
        <div className="flex gap-2">
          {[{ id: 1, name: "Kris" }, { id: 2, name: "Aksana" }].map((u) => (
            <Badge
              key={u.id}
              variant="outline"
              className={`cursor-pointer ${userId === u.id ? "bg-green-50 text-green-700 border-green-200" : ""}`}
              onClick={() => { setUserId(u.id); setPlan(null); }}
            >
              {u.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={generatePlan}
        disabled={generating}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {generating ? "AI generuje plan... (30-60s)" : plan ? "Wygeneruj nowy plan" : "Wygeneruj plan na tydzien (AI)"}
      </Button>

      {!plan && !generating && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Kliknij przycisk powyzej, aby AI wygenerowalo plan posilkow na caly tydzien
            dopasowany do Twojej diety.
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card className="animate-pulse border-green-300">
          <CardContent className="py-8 text-center text-sm text-green-600">
            Claude generuje 7-dniowy plan posilkow...<br />
            Uwzglednia GLP-1, antyrefluks, {userId === 1 ? "testosteron" : "hormony kobiece"}, przeciwzapalne.<br />
            To moze zając 30-60 sekund.
          </CardContent>
        </Card>
      )}

      {plan && plan.days && (
        <>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {plan.days.map((day, i) => (
              <button
                key={i}
                onClick={() => { setSelectedDay(i); setExpandedMeal(null); }}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  selectedDay === i
                    ? "bg-green-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {DAYS_SHORT[i] || day.day?.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Meals */}
          {dayPlan && (
            <div className="space-y-3">
              {dayPlan.meals.map((meal, i) => (
                <Card
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}
                >
                  <CardHeader className="pb-1 pt-3 px-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                        {meal.type}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {meal.prepTimeMin && (
                          <span className="text-[10px] text-muted-foreground">{meal.prepTimeMin} min</span>
                        )}
                        <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <p className="font-medium text-sm">{meal.name}</p>

                    {/* Tags */}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {meal.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={`text-[10px] py-0 px-1.5 ${TAG_COLORS[tag] || ""}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Eating order hint */}
                    {meal.eatingOrderHint && (
                      <p className="text-[10px] text-green-600 mt-1.5">{meal.eatingOrderHint}</p>
                    )}

                    {/* Expanded: macros + ingredients */}
                    {expandedMeal === i && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-2 text-center mb-3">
                          <div>
                            <div className="text-sm font-bold text-blue-600">{meal.protein}g</div>
                            <div className="text-[9px] text-muted-foreground">bialko</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-yellow-600">{meal.fat}g</div>
                            <div className="text-[9px] text-muted-foreground">tluszcz</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-orange-600">{meal.carbs}g</div>
                            <div className="text-[9px] text-muted-foreground">wegle</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold">{meal.fiber}g</div>
                            <div className="text-[9px] text-muted-foreground">blonnik</div>
                          </div>
                        </div>

                        {/* Ingredients */}
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Skladniki:</div>
                            {meal.ingredients.map((ing, j) => (
                              <div key={j} className="text-xs text-muted-foreground">
                                • {ing.name} — {ing.quantity} {ing.unit}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Day totals */}
          {dayTotals && (
            <Card className="border-dashed">
              <CardContent className="py-3 text-center text-sm">
                <span className="font-medium">{dayTotals.calories} kcal</span>
                <span className="text-muted-foreground"> | B: {dayTotals.protein}g | T: {dayTotals.fat}g | W: {dayTotals.carbs}g</span>
              </CardContent>
            </Card>
          )}

          {/* Generate shopping list */}
          <GenerateShoppingButton userId={userId} />
        </>
      )}
    </div>
  );
}

function GenerateShoppingButton({ userId }: { userId: number }) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ generated: number } | null>(null);

  const generate = async () => {
    setGenerating(true);
    const res = await fetch("/api/shopping/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setResult(data);
    setGenerating(false);
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={generate}
        disabled={generating}
        variant="outline"
        className="w-full"
      >
        {generating ? "Generuje liste..." : "Wygeneruj liste zakupow z planu"}
      </Button>
      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-2 text-center text-sm text-green-700">
            Wygenerowano {result.generated} produktow!{" "}
            <a href="/shopping" className="underline font-medium">Zobacz liste →</a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
