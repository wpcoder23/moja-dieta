"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Supplement = {
  id: number;
  name: string;
  dosage: string | null;
  timeOfDay: string | null;
  taken: boolean;
  logId: number | null;
};

const TIME_LABELS: Record<string, string> = {
  morning: "rano",
  evening: "wieczor",
  with_meal: "do posilku",
};

export default function SupplementsPage() {
  const [krisSupps, setKrisSupps] = useState<Supplement[]>([]);
  const [aksanaSupps, setAksanaSupps] = useState<Supplement[]>([]);

  const fetchSupps = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch("/api/supplements?userId=1"),
      fetch("/api/supplements?userId=2"),
    ]);
    setKrisSupps(await r1.json());
    setAksanaSupps(await r2.json());
  }, []);

  useEffect(() => {
    fetchSupps();
  }, [fetchSupps]);

  const toggle = async (userId: number, supplementId: number, taken: boolean, logId: number | null) => {
    if (taken && logId) {
      await fetch(`/api/supplements?logId=${logId}`, { method: "DELETE" });
    } else {
      await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, supplementId }),
      });
    }
    fetchSupps();
  };

  const krisTaken = krisSupps.filter((s) => s.taken).length;
  const aksanaTaken = aksanaSupps.filter((s) => s.taken).length;

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Suplementy</h1>

      <SupplementCard
        name="Kris"
        supplements={krisSupps}
        taken={krisTaken}
        userId={1}
        onToggle={toggle}
      />

      <SupplementCard
        name="Aksana"
        supplements={aksanaSupps}
        taken={aksanaTaken}
        userId={2}
        onToggle={toggle}
      />
    </div>
  );
}

function SupplementCard({ name, supplements, taken, userId, onToggle }: {
  name: string;
  supplements: Supplement[];
  taken: number;
  userId: number;
  onToggle: (userId: number, supplementId: number, taken: boolean, logId: number | null) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{name}</CardTitle>
          <Badge
            variant="secondary"
            className={`text-[10px] ${taken === supplements.length ? "bg-green-100 text-green-700" : ""}`}
          >
            {taken} / {supplements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {supplements.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <Checkbox
              checked={s.taken}
              onCheckedChange={() => onToggle(userId, s.id, s.taken, s.logId)}
            />
            <div className="flex-1">
              <div className={`text-sm font-medium ${s.taken ? "line-through text-muted-foreground" : ""}`}>
                {s.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.dosage} — {TIME_LABELS[s.timeOfDay || ""] || s.timeOfDay}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
