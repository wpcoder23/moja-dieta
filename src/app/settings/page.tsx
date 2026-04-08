"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const MENU_ITEMS = [
  { href: "/water", label: "Tracker wody", desc: "Ile wypiles dzisiaj" },
  { href: "/supplements", label: "Suplementy", desc: "Checklist dzienny" },
  { href: "/fasting", label: "Post przerywany", desc: "Timer okna jedzenia" },
  { href: "/cycle", label: "Cykl (Aksana)", desc: "Faza cyklu + carb cycling" },
  { href: "/progress", label: "Waga i aktywnosc", desc: "Wykres, treningi" },
  { href: "/scan", label: "Skaner jedzenia AI", desc: "Zdjecie posilku → kalorie" },
  { href: "/receipt", label: "Skaner paragonu", desc: "Zdjecie paragonu → produkty + ocena diety" },
  { href: "/steps", label: "Kroki (iOS Shortcut)", desc: "Instrukcja synchronizacji krokow" },
];

export default function SettingsPage() {
  const { permission, subscribed, subscribe } = usePushNotifications(1);

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Menu</h1>

      {/* Push notification banner */}
      {permission !== "granted" && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-700">Powiadomienia</div>
              <div className="text-xs text-green-600">Przypomnienia o suplementach, wodzie, wadze</div>
            </div>
            <Button size="sm" onClick={subscribe} className="bg-green-600 hover:bg-green-700">
              Wlacz
            </Button>
          </CardContent>
        </Card>
      )}
      {subscribed && (
        <Badge className="bg-green-100 text-green-700">Powiadomienia aktywne</Badge>
      )}

      <div className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer mb-2">
              <CardContent className="py-3 px-4">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
