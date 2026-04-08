"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const GOAL = 2500; // ml
const GLASS = 250; // ml

export default function WaterPage() {
  const [water, setWater] = useState(0);
  const [userId, setUserId] = useState(1);

  const fetchWater = useCallback(async () => {
    const res = await fetch(`/api/water?userId=${userId}`);
    const data = await res.json();
    setWater(data.waterMl || 0);
  }, [userId]);

  useEffect(() => {
    fetchWater();
  }, [fetchWater]);

  const addWater = async (ml: number) => {
    setWater((prev) => prev + ml);
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: ml }),
    });
  };

  const pct = Math.min(100, Math.round((water / GOAL) * 100));
  const glasses = Math.floor(water / GLASS);
  const totalGlasses = Math.ceil(GOAL / GLASS);

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Woda</h1>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={`cursor-pointer ${userId === 1 ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            onClick={() => setUserId(1)}
          >
            Kris
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer ${userId === 2 ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            onClick={() => setUserId(2)}
          >
            Aksana
          </Badge>
        </div>
      </div>

      {/* Visual tracker */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold">{water} ml</div>
            <div className="text-sm text-muted-foreground">/ {GOAL} ml</div>
          </div>

          <Progress value={pct} className="h-4 mb-4" />

          {/* Glass grid */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Array.from({ length: totalGlasses }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-10 rounded-b-lg border-2 ${
                  i < glasses
                    ? "bg-blue-400 border-blue-500"
                    : "bg-muted border-border"
                }`}
              />
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground mb-4">
            {glasses} / {totalGlasses} szklanek
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => addWater(GLASS)}
              className="bg-blue-500 hover:bg-blue-600 text-lg px-6"
            >
              + Szklanka (250ml)
            </Button>
            <Button
              onClick={() => addWater(500)}
              variant="outline"
            >
              + 500ml
            </Button>
          </div>
        </CardContent>
      </Card>

      {pct >= 100 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 text-center text-green-700 font-medium">
            Cel osiagniety! Swietna robota!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
