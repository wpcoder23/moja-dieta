"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ScanResult = {
  items: { name: string; grams: number; calories: number; protein: number; fat: number; carbs: number; fiber: number }[];
  total: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  isGlp1Friendly: boolean;
  isAntiInflammatory: boolean;
  eatingOrderHint: string;
};

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setResult(null);

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      // Compress and convert to base64
      const base64 = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          userId: 1, // TODO: use active user
          mealType: "snack",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Skaner jedzenia</h1>
      <p className="text-sm text-muted-foreground">
        Zrob zdjecie posilku, AI oszacuje kalorie i makro
      </p>

      {/* Camera capture */}
      <Card className={scanning ? "border-green-500 animate-pulse" : "border-dashed"}>
        <CardContent className="py-8 flex flex-col items-center gap-4">
          {preview ? (
            <img src={preview} alt="Zdjęcie posiłku" className="w-full max-w-xs rounded-lg" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
          )}

          <Button
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            className="bg-green-600 hover:bg-green-700"
          >
            {scanning ? "Analizuje..." : preview ? "Nowe zdjecie" : "Zrob zdjecie"}
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapture}
          />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Wynik analizy</CardTitle>
                <div className="flex gap-1">
                  {result.isGlp1Friendly && <Badge className="bg-green-100 text-green-700 text-[10px]">GLP-1</Badge>}
                  {result.isAntiInflammatory && <Badge className="bg-blue-100 text-blue-700 text-[10px]">Przeciwzapalny</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">~{item.grams}g</span>
                  </div>
                  <span className="text-sm">{item.calories} kcal</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold">{result.total.calories}</div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">{result.total.protein}g</div>
                  <div className="text-[10px] text-muted-foreground">bialko</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{result.total.fat}g</div>
                  <div className="text-[10px] text-muted-foreground">tluszcz</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{result.total.carbs}g</div>
                  <div className="text-[10px] text-muted-foreground">wegle</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eating order hint */}
          {result.eatingOrderHint && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-3 text-sm text-green-700">
                {result.eatingOrderHint}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/xxx;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
