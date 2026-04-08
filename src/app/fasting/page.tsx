"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_WINDOW_START = 12; // 12:00
const DEFAULT_WINDOW_END = 20; // 20:00

export default function FastingPage() {
  const [windowStart, setWindowStart] = useState(DEFAULT_WINDOW_START);
  const [windowEnd, setWindowEnd] = useState(DEFAULT_WINDOW_END);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = now.getHours() + now.getMinutes() / 60;
  const isEatingWindow = currentHour >= windowStart && currentHour < windowEnd;
  const fastingHours = 24 - (windowEnd - windowStart);
  const eatingHours = windowEnd - windowStart;

  // Time until next state change
  let minutesUntilChange: number;
  if (isEatingWindow) {
    minutesUntilChange = Math.round((windowEnd - currentHour) * 60);
  } else if (currentHour < windowStart) {
    minutesUntilChange = Math.round((windowStart - currentHour) * 60);
  } else {
    minutesUntilChange = Math.round((24 - currentHour + windowStart) * 60);
  }
  const hoursLeft = Math.floor(minutesUntilChange / 60);
  const minsLeft = minutesUntilChange % 60;

  // Anti-reflux: warn if eating window ends less than 3h before typical bedtime (23:00)
  const bedtime = 23;
  const hoursBeforeBed = bedtime - windowEnd;
  const refluxWarning = hoursBeforeBed < 3;

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Post przerywany</h1>

      {/* Status */}
      <Card className={isEatingWindow ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"}>
        <CardContent className="py-6 text-center">
          <Badge className={`mb-2 ${isEatingWindow ? "bg-green-600" : "bg-orange-600"}`}>
            {isEatingWindow ? "OKNO JEDZENIA" : "POST"}
          </Badge>
          <div className="text-4xl font-bold mt-2">
            {hoursLeft}h {minsLeft}m
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            do {isEatingWindow ? "zamkniecia okna" : "otwarcia okna"}
          </div>
        </CardContent>
      </Card>

      {/* Window settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Okno jedzenia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Od</div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWindowStart(Math.max(6, windowStart - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-bold w-14 text-center">{windowStart}:00</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWindowStart(Math.min(windowEnd - 1, windowStart + 1))}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Do</div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWindowEnd(Math.max(windowStart + 1, windowEnd - 1))}
                >
                  -
                </Button>
                <span className="text-lg font-bold w-14 text-center">{windowEnd}:00</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWindowEnd(Math.min(23, windowEnd + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Post: {fastingHours}h</span>
            <span>Jedzenie: {eatingHours}h</span>
          </div>

          {/* Visual timeline */}
          <div className="mt-4 h-6 bg-orange-200 rounded-full relative overflow-hidden">
            <div
              className="absolute h-full bg-green-400 rounded-full"
              style={{
                left: `${(windowStart / 24) * 100}%`,
                width: `${((windowEnd - windowStart) / 24) * 100}%`,
              }}
            />
            {/* Current time indicator */}
            <div
              className="absolute h-full w-0.5 bg-black"
              style={{ left: `${(currentHour / 24) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0:00</span>
            <span>6:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </CardContent>
      </Card>

      {/* Anti-reflux warning */}
      {refluxWarning && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-3 text-sm text-red-700">
            Uwaga: okno jedzenia konczy sie mniej niz 3h przed snem.
            Dla antyrefluksu przesun koniec okna wczesniej (np. {bedtime - 3}:00).
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent className="py-3 text-xs text-muted-foreground space-y-1">
          <p>Protokol {fastingHours}:{eatingHours} (np. 16:8)</p>
          <p>GLP-1 rosnie naturalnie podczas postu.</p>
          <p>Kris: okno musi sie zamknac min. 3h przed snem (antyrefluks).</p>
        </CardContent>
      </Card>
    </div>
  );
}
