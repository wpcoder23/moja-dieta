"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ReceiptItem = {
  name: string;
  quantity: number;
  price: number;
  fitsDiet: boolean;
  reason: string;
  category: string;
  estimatedCaloriesPer100g: number;
  estimatedProteinPer100g: number;
  estimatedFatPer100g: number;
  estimatedCarbsPer100g: number;
};

type ReceiptResult = {
  store: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  dietSummary: string;
};

export default function ReceiptPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ReceiptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [addingToShop, setAddingToShop] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type || "image/jpeg" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Scan failed");
      }

      setResult(await res.json());
    } catch (err) {
      setError(String(err));
    } finally {
      setScanning(false);
    }
  };

  const addFittingToShoppingList = async () => {
    if (!result) return;
    setAddingToShop(true);
    const fitting = result.items.filter((i) => i.fitsDiet);
    for (const item of fitting) {
      await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          store: result.store.toLowerCase(),
          category: item.category,
          notes: `${item.estimatedCaloriesPer100g} kcal/100g`,
        }),
      });
    }
    setAddingToShop(false);
    alert(`Dodano ${fitting.length} produktow do listy zakupow!`);
  };

  const fittingCount = result?.items.filter((i) => i.fitsDiet).length || 0;
  const notFittingCount = result?.items.filter((i) => !i.fitsDiet).length || 0;

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Skaner paragonu</h1>
      <p className="text-sm text-muted-foreground">
        Zrob zdjecie paragonu — AI odczyta produkty i oceni co pasuje do diety
      </p>

      {/* Upload */}
      <Card className={scanning ? "border-green-500 animate-pulse" : "border-dashed"}>
        <CardContent className="py-8 flex flex-col items-center gap-4">
          {preview ? (
            <img src={preview} alt="Paragon" className="w-full max-w-xs rounded-lg max-h-64 object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 8h10M7 12h4" />
              </svg>
            </div>
          )}
          <Button onClick={() => fileRef.current?.click()} disabled={scanning} className="bg-green-600 hover:bg-green-700">
            {scanning ? "Analizuje paragon... (30-60s)" : preview ? "Nowy paragon" : "Zrob zdjecie paragonu"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {result && (
        <>
          {/* Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium">{result.store}</span>
                  <span className="text-sm text-muted-foreground ml-2">{result.date}</span>
                </div>
                <span className="font-bold">{result.total} PLN</span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">{fittingCount} pasuje</Badge>
                <Badge className="bg-red-100 text-red-700">{notFittingCount} nie pasuje</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{result.dietSummary}</p>
            </CardContent>
          </Card>

          {/* Add to shopping list */}
          <Button onClick={addFittingToShoppingList} disabled={addingToShop} variant="outline" className="w-full">
            {addingToShop ? "Dodaje..." : `Dodaj ${fittingCount} pasujacych do listy zakupow`}
          </Button>

          {/* Items */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-green-600">Pasuje do diety ({fittingCount})</h2>
            {result.items.filter((i) => i.fitsDiet).map((item, idx) => (
              <ItemCard key={idx} item={item} />
            ))}

            {notFittingCount > 0 && (
              <>
                <h2 className="text-sm font-medium text-red-600 mt-4">Nie pasuje ({notFittingCount})</h2>
                {result.items.filter((i) => !i.fitsDiet).map((item, idx) => (
                  <ItemCard key={idx} item={item} />
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ItemCard({ item }: { item: ReceiptItem }) {
  return (
    <Card className={item.fitsDiet ? "" : "opacity-60"}>
      <CardContent className="py-2 px-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${item.fitsDiet ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-[10px] text-muted-foreground ml-4">{item.reason}</div>
            <div className="text-[10px] text-muted-foreground ml-4">
              ~{item.estimatedCaloriesPer100g} kcal | B:{item.estimatedProteinPer100g}g T:{item.estimatedFatPer100g}g W:{item.estimatedCarbsPer100g}g /100g
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{item.price} zl</span>
        </div>
      </CardContent>
    </Card>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
