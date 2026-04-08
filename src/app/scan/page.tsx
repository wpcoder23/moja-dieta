"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Skaner jedzenia</h1>
      <p className="text-sm text-muted-foreground">
        Zrob zdjecie posilku, AI oszacuje kalorie i makroskladniki
      </p>

      <Card className="border-dashed">
        <CardContent className="py-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            Zrob zdjecie
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            id="food-camera"
          />
          <p className="text-xs text-muted-foreground text-center">
            Aparat otworzy sie na telefonie.<br />
            Na komputerze mozesz wybrac plik.
          </p>
        </CardContent>
      </Card>

      {/* Recent scans */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Ostatnie skany</h2>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Brak skanow. Zrob pierwsze zdjecie posilku!
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
