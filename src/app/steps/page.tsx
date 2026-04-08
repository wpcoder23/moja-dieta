"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StepsPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Kroki z iOS</h1>
      <p className="text-sm text-muted-foreground">
        Jak automatycznie synchronizowac kroki z aplikacji Zdrowie na iPhonie.
      </p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Instrukcja — iOS Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Step n={1} text='Otworz aplikacje "Skroty" (Shortcuts) na iPhonie' />
          <Step n={2} text='Kliknij "+" w prawym gornym rogu' />
          <Step n={3} text='Dodaj akcje "Znajdz probki zdrowia" (Find Health Samples)' />
          <Step n={4} text='Ustaw: Typ = Kroki, Okres = Dzisiaj' />
          <Step n={5} text='Dodaj akcje "Pobierz zawartosc URL" (Get Contents of URL)' />
          <Step n={6} text={`URL: https://moja-dieta.duckdns.org/api/activity`} />
          <Step n={7} text='Metoda: POST, Body: JSON' />
          <Step
            n={8}
            text={`Body JSON:
{
  "userId": 1,
  "steps": [wartość z Kroki],
  "stepsCalories": [szacunek],
  "source": "ios_shortcut"
}`}
          />
          <Step n={9} text='Nazwij skrot "Sync Kroki"' />
          <Step n={10} text='W Automatyzacjach: codziennie o 22:00 uruchamiaj ten skrot' />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dla Aksany</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          To samo, ale zmien "userId": 1 na "userId": 2 w body JSON.
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="py-3 text-xs text-muted-foreground">
          Alternatywnie: mozesz recznie wpisywac kroki na stronie Progres.
          Srednie kroki (Kris: 11k, Aksana: 7k) sa liczone automatycznie w dashboardzie.
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {n}
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap">{text}</p>
    </div>
  );
}
