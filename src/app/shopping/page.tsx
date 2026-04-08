"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ShoppingItem = {
  id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  store: string;
  category: string | null;
  isChecked: boolean;
  notes: string | null;
};

const STORES = ["Wszystkie", "Lidl", "Biedronka", "Auchan"];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [activeStore, setActiveStore] = useState("Wszystkie");

  const fetchItems = useCallback(async () => {
    const store = activeStore === "Wszystkie" ? "all" : activeStore.toLowerCase();
    const res = await fetch(`/api/shopping?store=${store}`);
    const data = await res.json();
    setItems(data);
  }, [activeStore]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const toggleItem = async (id: number, checked: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isChecked: checked } : i)));
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isChecked: checked }),
    });
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    const store = activeStore === "Wszystkie" ? "any" : activeStore.toLowerCase();
    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItem.trim(), store }),
    });
    setNewItem("");
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/shopping?id=${id}`, { method: "DELETE" });
  };

  const grouped = groupByCategory(items);
  const checkedCount = items.filter((i) => i.isChecked).length;

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lista zakupow</h1>
        <Badge variant="secondary">{checkedCount} / {items.length}</Badge>
      </div>

      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Dodaj produkt..."
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1"
        />
        <Button onClick={addItem} className="bg-green-600 hover:bg-green-700">+</Button>
      </div>

      <Tabs value={activeStore} onValueChange={setActiveStore}>
        <TabsList className="w-full grid grid-cols-4">
          {STORES.map((store) => (
            <TabsTrigger key={store} value={store} className="text-xs">
              {store}
            </TabsTrigger>
          ))}
        </TabsList>

        {STORES.map((store) => (
          <TabsContent key={store} value={store} className="space-y-3 mt-4">
            {grouped.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Lista pusta. Dodaj produkty lub wygeneruj z planu.
                </CardContent>
              </Card>
            ) : (
              grouped.map(([category, catItems]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {categoryLabel(category)}
                  </h3>
                  {catItems.map((item) => (
                    <Card key={item.id} className="mb-1">
                      <CardContent className="py-2 px-3 flex items-center gap-3">
                        <Checkbox
                          checked={item.isChecked}
                          onCheckedChange={(checked) => toggleItem(item.id, !!checked)}
                        />
                        <span className={`text-sm flex-1 ${item.isChecked ? "line-through text-muted-foreground" : ""}`}>
                          {item.name}
                          {item.quantity && ` — ${item.quantity}${item.unit || ""}`}
                        </span>
                        {item.notes && (
                          <Badge variant="outline" className="text-[9px]">{item.notes}</Badge>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          x
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function groupByCategory(items: ShoppingItem[]): [string, ShoppingItem[]][] {
  const groups: Record<string, ShoppingItem[]> = {};
  for (const item of items) {
    const cat = item.category || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return Object.entries(groups);
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    meat: "Mieso / Ryby",
    fish: "Ryby",
    dairy: "Nabial / Jaja",
    vegetable: "Warzywa",
    fruit: "Owoce",
    fat: "Tluszcze / Nasiona",
    fermented: "Fermentowane",
    spice: "Przyprawy",
    other: "Inne",
  };
  return labels[cat] || cat;
}
