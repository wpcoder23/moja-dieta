"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type DashboardData = {
  user: {
    name: string;
    gender: string;
    calorieTarget: number;
    proteinTarget: number;
    fatTarget: number;
    carbTarget: number;
    carbMin: number | null;
  };
  weight: { current: number | null; target: number | null };
  today: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
    steps: number;
    burned: number;
    deficit: number;
    glp1Score: number;
    antiInflammatoryScore: number;
  };
  supplements: { total: number; taken: number };
  scansToday: number;
};

export default function DashboardPage() {
  const [userId, setUserId] = useState(1);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchDashboard = useCallback(async () => {
    const res = await fetch(`/api/dashboard?userId=${userId}`);
    setData(await res.json());
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Ladowanie...</div>
      </div>
    );
  }

  const { user, today, supplements, weight } = data;
  const calPct = Math.min(100, Math.round((today.calories / user.calorieTarget) * 100));

  return (
    <div className="space-y-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moja Dieta</h1>
          <p className="text-sm text-muted-foreground">Witaj, {user.name}</p>
        </div>
        <div className="flex gap-2">
          {[{ id: 1, name: "Kris" }, { id: 2, name: "Aksana" }].map((u) => (
            <Badge
              key={u.id}
              variant="outline"
              className={`cursor-pointer ${userId === u.id ? "bg-green-50 text-green-700 border-green-200" : ""}`}
              onClick={() => setUserId(u.id)}
            >
              {u.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Weight banner */}
      {weight.current && weight.target && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
          <span className="text-sm text-muted-foreground">Waga</span>
          <span className="text-sm font-medium">
            {weight.current} kg → {weight.target} kg
            <span className="text-muted-foreground ml-1">
              (jeszcze {(weight.current - weight.target).toFixed(1)} kg)
            </span>
          </span>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          onClick={() => window.location.href = "/log-meal"}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700"
        >
          + Zapisz posilek
        </button>
        <button
          onClick={() => window.location.href = "/scan"}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
        >
          Skanuj AI
        </button>
      </div>

      {/* Calorie Balance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Bilans kaloryczny
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-bold">{today.calories}</span>
            <span className="text-sm text-muted-foreground">/ {user.calorieTarget} kcal</span>
          </div>
          <Progress value={calPct} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Zjedzone: {today.calories}</span>
            <span>Spalone: {today.burned}</span>
            <span className={`font-medium ${today.deficit > 0 ? "text-green-600" : "text-red-600"}`}>
              {today.deficit > 0 ? "Deficyt" : "Nadwyzka"}: {Math.abs(today.deficit)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        <MacroCard label="Bialko" current={today.protein} target={user.proteinTarget} unit="g" color="blue" />
        <MacroCard label="Tluszcz" current={today.fat} target={user.fatTarget} unit="g" color="yellow" />
        <MacroCard
          label="Wegle"
          current={today.carbs}
          target={user.carbTarget}
          unit="g"
          color="orange"
          min={user.carbMin}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="cursor-pointer" onClick={() => window.location.href = "/water"}>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Woda</div>
            <div className="text-lg font-bold">{today.water} ml</div>
            <Progress value={Math.min(100, (today.water / 2500) * 100)} className="h-1 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Kroki</div>
            <div className="text-lg font-bold">{today.steps.toLocaleString()}</div>
            <Progress value={Math.min(100, (today.steps / (userId === 1 ? 11000 : 7000)) * 100)} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Scores */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between">
            <ScoreBadge label="GLP-1" value={today.glp1Score} max={5} />
            <ScoreBadge label="Przeciwzapalny" value={today.antiInflammatoryScore} max={5} />
            <div className="cursor-pointer" onClick={() => window.location.href = "/supplements"}>
              <ScoreBadge label="Suplementy" value={supplements.taken} max={supplements.total} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground text-center">Skany</div>
              <div className="text-lg font-bold text-center">{data.scansToday}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Mikroskladniki (29)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-1">
            {MICRONUTRIENTS.map((m) => (
              <div
                key={m}
                className="text-[9px] text-center py-1 px-0.5 rounded bg-red-100 text-red-700"
                title={m}
              >
                {m}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Czerwony = &lt;50% RDA | Zolty = 50-80% | Zielony = &gt;80%
          </p>
        </CardContent>
      </Card>

      {/* Carb warning for Aksana */}
      {user.gender === "F" && user.carbMin && today.carbs < user.carbMin && today.calories > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="py-3 text-sm text-orange-700">
            Weglowodany ponizej minimum ({today.carbs}g / min. {user.carbMin}g).
            Dodaj bataty lub marchewke — ochrona hormonow!
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MacroCard({ label, current, target, unit, color, min }: {
  label: string; current: number; target: number; unit: string; color: string; min?: number | null;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    orange: "text-orange-600",
  };
  const belowMin = min && current < min && current > 0;
  return (
    <Card className={belowMin ? "border-orange-300" : ""}>
      <CardContent className="pt-3 pb-3 px-3">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold ${colorMap[color]}`}>{Math.round(current)}</div>
        <div className="text-[10px] text-muted-foreground">/ {target}{unit}</div>
        <Progress value={pct} className="h-1 mt-1" />
        {min && <div className="text-[8px] text-orange-500 mt-0.5">min. {min}{unit}</div>}
      </CardContent>
    </Card>
  );
}

function ScoreBadge({ label, value, max }: { label: string; value: number; max: number }) {
  const full = value >= max;
  return (
    <div>
      <div className="text-xs text-muted-foreground text-center">{label}</div>
      <div className={`text-lg font-bold text-center ${full ? "text-green-600" : ""}`}>
        {value} / {max}
      </div>
    </div>
  );
}

const MICRONUTRIENTS = [
  "A", "B1", "B2", "B3", "B5", "B6",
  "B7", "B9", "B12", "C", "D", "E",
  "K", "Ca", "Mg", "K+", "Na", "P",
  "Cl", "S", "Fe", "Zn", "I", "Cu",
  "Se", "Mn", "F", "Cr", "Mo",
];
