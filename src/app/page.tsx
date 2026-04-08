"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const user = { name: "Kris", calorieTarget: 2500, proteinTarget: 175, fatTarget: 160, carbTarget: 90 };
  const today = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    water: 0,
    steps: 0,
    burned: 0,
  };

  const deficit = user.calorieTarget - today.calories + today.burned;

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moja Dieta</h1>
          <p className="text-sm text-muted-foreground">Witaj, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer bg-green-50 text-green-700 border-green-200">
            Kris
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            Aksana
          </Badge>
        </div>
      </div>

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
          <Progress value={0} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Zjedzone: {today.calories}</span>
            <span>Spalone: {today.burned}</span>
            <span className="text-green-600 font-medium">Deficyt: {deficit}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <MacroCard label="Bialko" current={today.protein} target={user.proteinTarget} unit="g" color="blue" />
        <MacroCard label="Tluszcz" current={today.fat} target={user.fatTarget} unit="g" color="yellow" />
        <MacroCard label="Wegle" current={today.carbs} target={user.carbTarget} unit="g" color="orange" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Woda</div>
            <div className="text-lg font-bold">{today.water} ml</div>
            <div className="text-xs text-muted-foreground">/ 2500 ml</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Kroki</div>
            <div className="text-lg font-bold">{today.steps}</div>
            <div className="text-xs text-muted-foreground">/ 11 000</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-muted-foreground">GLP-1 Score</div>
              <div className="text-lg font-bold">0 / 5</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Przeciwzapalny</div>
              <div className="text-lg font-bold">0 / 5</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Suplementy</div>
              <div className="text-lg font-bold">0 / 6</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}

function MacroCard({ label, current, target, unit, color }: {
  label: string; current: number; target: number; unit: string; color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const colorMap: Record<string, string> = {
    blue: "text-blue-600",
    yellow: "text-yellow-600",
    orange: "text-orange-600",
  };
  return (
    <Card>
      <CardContent className="pt-3 pb-3 px-3">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold ${colorMap[color]}`}>{current}</div>
        <div className="text-[10px] text-muted-foreground">/ {target}{unit}</div>
        <Progress value={pct} className="h-1 mt-1" />
      </CardContent>
    </Card>
  );
}

const MICRONUTRIENTS = [
  "A", "B1", "B2", "B3", "B5", "B6",
  "B7", "B9", "B12", "C", "D", "E",
  "K", "Ca", "Mg", "K+", "Na", "P",
  "Cl", "S", "Fe", "Zn", "I", "Cu",
  "Se", "Mn", "F", "Cr", "Mo",
];
