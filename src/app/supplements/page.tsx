"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const KRIS_SUPPLEMENTS = [
  { name: "D3+K2 (Keto Centrum)", dosage: "5000 IU", time: "rano", taken: false },
  { name: "Magnez (glicynian)", dosage: "400 mg", time: "wieczor", taken: false },
  { name: "Omega-3 (EPA+DHA)", dosage: "2g", time: "do posilku", taken: false },
  { name: "Witamina E", dosage: "200 IU", time: "do posilku", taken: false },
  { name: "Cynk", dosage: "30 mg", time: "rano", taken: false },
  { name: "Bor", dosage: "6 mg", time: "rano", taken: false },
];

const AKSANA_SUPPLEMENTS = [
  { name: "D3+K2 (Keto Centrum)", dosage: "3000 IU", time: "rano", taken: false },
  { name: "Magnez (glicynian)", dosage: "300 mg", time: "wieczor", taken: false },
  { name: "Omega-3 (EPA+DHA)", dosage: "2g", time: "do posilku", taken: false },
  { name: "Witamina E", dosage: "200 IU", time: "do posilku", taken: false },
  { name: "Cynk", dosage: "15 mg", time: "rano", taken: false },
  { name: "B6 (P5P)", dosage: "50 mg", time: "rano", taken: false },
  { name: "Siemie lniane", dosage: "1 lyzka", time: "rano", taken: false },
];

export default function SupplementsPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Suplementy</h1>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Kris</CardTitle>
            <Badge variant="secondary" className="text-[10px]">0 / {KRIS_SUPPLEMENTS.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {KRIS_SUPPLEMENTS.map((s) => (
            <SupplementRow key={s.name} {...s} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Aksana</CardTitle>
            <Badge variant="secondary" className="text-[10px]">0 / {AKSANA_SUPPLEMENTS.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {AKSANA_SUPPLEMENTS.map((s) => (
            <SupplementRow key={s.name} {...s} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SupplementRow({ name, dosage, time, taken }: {
  name: string; dosage: string; time: string; taken: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={taken} />
      <div className="flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{dosage} — {time}</div>
      </div>
    </div>
  );
}
