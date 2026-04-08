"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const MENU_ITEMS = [
  { href: "/water", label: "Tracker wody", desc: "Ile wypiles dzisiaj" },
  { href: "/supplements", label: "Suplementy", desc: "Checklist dzienny" },
  { href: "/fasting", label: "Post przerywany", desc: "Timer okna jedzenia" },
  { href: "/cycle", label: "Cykl (Aksana)", desc: "Faza cyklu + carb cycling" },
  { href: "/progress", label: "Waga i aktywnosc", desc: "Wykres, treningi" },
  { href: "/scan", label: "Skaner AI", desc: "Zdjecie → kalorie" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Menu</h1>

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
