"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function CyclePage() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [saved, setSaved] = useState(false);

  // Calculate phase based on last period date
  const getPhase = () => {
    if (!lastPeriod) return null;
    const start = new Date(lastPeriod);
    const today = new Date();
    const dayOfCycle = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const adjustedDay = ((dayOfCycle - 1) % cycleLength) + 1;

    if (adjustedDay <= 5) return { phase: "Miesiaczka", day: adjustedDay, color: "bg-red-100 text-red-700 border-red-200", carbAdvice: "Normalnie" };
    if (adjustedDay <= 13) return { phase: "Folikularna", day: adjustedDay, color: "bg-blue-100 text-blue-700 border-blue-200", carbAdvice: "Mozna nieco ograniczyc wegle (~75g)" };
    if (adjustedDay <= 16) return { phase: "Owulacja", day: adjustedDay, color: "bg-purple-100 text-purple-700 border-purple-200", carbAdvice: "Normalnie" };
    return { phase: "Lutealna", day: adjustedDay, color: "bg-orange-100 text-orange-700 border-orange-200", carbAdvice: "WIECEJ WEGLI! +20-30g (100-130g/dzien). Bataty, marchewka." };
  };

  const phase = getPhase();

  const handleSave = async () => {
    if (!lastPeriod) return;
    // TODO: save to /api/cycle
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Next period prediction
  const getNextPeriod = () => {
    if (!lastPeriod) return null;
    const start = new Date(lastPeriod);
    const next = new Date(start);
    const today = new Date();
    while (next <= today) {
      next.setDate(next.getDate() + cycleLength);
    }
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { date: next.toISOString().split("T")[0], daysUntil };
  };

  const nextPeriod = getNextPeriod();

  // Should weigh warning
  const shouldNotWeigh = phase && (phase.phase === "Lutealna" || phase.phase === "Miesiaczka");

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Cykl Aksany</h1>

      {/* Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ostatnia miesiaczka</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="date"
            value={lastPeriod}
            onChange={(e) => setLastPeriod(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Dlugosc cyklu:</span>
            <Input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-20"
              min={21}
              max={35}
            />
            <span className="text-sm text-muted-foreground">dni</span>
          </div>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full">
            {saved ? "Zapisano!" : "Zapisz"}
          </Button>
        </CardContent>
      </Card>

      {/* Current phase */}
      {phase && (
        <Card className={`border ${phase.color.split(" ").filter(c => c.startsWith("border-")).join(" ")}`}>
          <CardContent className="py-4 text-center">
            <Badge className={phase.color}>{phase.phase}</Badge>
            <div className="text-2xl font-bold mt-2">Dzien {phase.day}</div>
            <div className="text-sm text-muted-foreground">z {cycleLength}-dniowego cyklu</div>
          </CardContent>
        </Card>
      )}

      {/* Carb advice */}
      {phase && (
        <Card className={phase.phase === "Lutealna" ? "border-orange-300 bg-orange-50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weglowodany</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{phase.carbAdvice}</p>
            {phase.phase === "Lutealna" && (
              <p className="text-xs text-muted-foreground mt-2">
                Naturalny wzrost apetytu +100-300 kcal jest NORMALNY.
                Nie panikuj — to hormony.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weigh warning */}
      {shouldNotWeigh && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700">
            Nie waz sie teraz! Retencja wody 1-3 kg jest normalna
            w fazie {phase?.phase?.toLowerCase()}.
          </CardContent>
        </Card>
      )}

      {/* Next period */}
      {nextPeriod && (
        <Card>
          <CardContent className="py-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nastepna miesiaczka</span>
              <span className="font-medium">
                {nextPeriod.date} (za {nextPeriod.daysUntil} dni)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Fazy cyklu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span><strong>Miesiaczka</strong> (dzien 1-5) — normalnie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span><strong>Folikularna</strong> (dzien 6-13) — mozna ograniczyc wegle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span><strong>Owulacja</strong> (dzien 14-16) — normalnie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span><strong>Lutealna</strong> (dzien 17-28) — WIECEJ wegli! +20-30g</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
