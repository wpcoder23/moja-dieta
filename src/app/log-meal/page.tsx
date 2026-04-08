"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const QUICK_MEALS = [
  { name: "Jajecznica (3 jajka)", calories: 350, protein: 21, fat: 27, carbs: 2 },
  { name: "Stek wolowy 200g", calories: 500, protein: 52, fat: 34, carbs: 0 },
  { name: "Losos 150g", calories: 310, protein: 30, fat: 20, carbs: 0 },
  { name: "Pierś kurczaka 200g", calories: 330, protein: 62, fat: 7, carbs: 0 },
  { name: "Awokado (cale)", calories: 240, protein: 3, fat: 22, carbs: 12 },
  { name: "Bataty 200g", calories: 172, protein: 3, fat: 0, carbs: 40 },
  { name: "Twarog 150g", calories: 147, protein: 17, fat: 6, carbs: 5 },
  { name: "Kiszona kapusta 100g", calories: 19, protein: 1, fat: 0, carbs: 4 },
  { name: "Bulion kostny 300ml", calories: 45, protein: 8, fat: 2, carbs: 2 },
  { name: "Czekolada 85% 30g", calories: 181, protein: 3, fat: 14, carbs: 10 },
  { name: "Kozie mleko 250ml", calories: 173, protein: 9, fat: 10, carbs: 11 },
  { name: "Ser bezlakt. 60g", calories: 214, protein: 15, fat: 16, carbs: 1 },
];

export default function LogMealPage() {
  const [userId, setUserId] = useState(1);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carbs, setCarbs] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const logMeal = async (mealName: string, cal: number, pro: number, f: number, c: number) => {
    setSaving(true);
    await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        mealName: mealName,
        calories: cal,
        protein: pro,
        fat: f,
        carbs: c,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const logCustom = () => {
    if (!calories) return;
    logMeal(
      name || "Reczny wpis",
      parseFloat(calories) || 0,
      parseFloat(protein) || 0,
      parseFloat(fat) || 0,
      parseFloat(carbs) || 0
    );
    setName("");
    setCalories("");
    setProtein("");
    setFat("");
    setCarbs("");
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zapisz posilek</h1>
        <div className="flex gap-2">
          {[{ id: 1, n: "Kris" }, { id: 2, n: "Aksana" }].map((u) => (
            <Badge
              key={u.id}
              variant="outline"
              className={`cursor-pointer ${userId === u.id ? "bg-green-50 text-green-700 border-green-200" : ""}`}
              onClick={() => setUserId(u.id)}
            >
              {u.n}
            </Badge>
          ))}
        </div>
      </div>

      {saved && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-2 text-center text-sm text-green-700 font-medium">
            Zapisano!
          </CardContent>
        </Card>
      )}

      {/* Quick add */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Szybkie dodawanie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_MEALS.map((meal) => (
              <button
                key={meal.name}
                onClick={() => logMeal(meal.name, meal.calories, meal.protein, meal.fat, meal.carbs)}
                disabled={saving}
                className="text-left p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="text-xs font-medium">{meal.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {meal.calories} kcal | B:{meal.protein} T:{meal.fat} W:{meal.carbs}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom entry */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Reczny wpis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Nazwa posilku" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Kalorie" value={calories} onChange={(e) => setCalories(e.target.value)} />
            <Input type="number" placeholder="Bialko (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
            <Input type="number" placeholder="Tluszcz (g)" value={fat} onChange={(e) => setFat(e.target.value)} />
            <Input type="number" placeholder="Wegle (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <Button onClick={logCustom} disabled={saving || !calories} className="w-full bg-green-600 hover:bg-green-700">
            {saving ? "Zapisuje..." : "Dodaj"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
