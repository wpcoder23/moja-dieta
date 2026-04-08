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

type Ingredient = {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  imageUrl: string | null;
  isGlp1Booster: boolean;
  isAntiInflammatory: boolean;
  storeAvailability: string;
  notes: string | null;
};

const STORES = ["Wszystkie", "Lidl", "Biedronka", "Auchan"];

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [newItem, setNewItem] = useState("");
  const [activeStore, setActiveStore] = useState("Wszystkie");
  const [view, setView] = useState<"list" | "catalog">("list");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");

  const fetchItems = useCallback(async () => {
    const store = activeStore === "Wszystkie" ? "all" : activeStore.toLowerCase();
    const res = await fetch(`/api/shopping?store=${store}`);
    setItems(await res.json());
  }, [activeStore]);

  const fetchIngredients = useCallback(async () => {
    const res = await fetch("/api/ingredients");
    setIngredients(await res.json());
  }, []);

  useEffect(() => {
    fetchItems();
    fetchIngredients();
  }, [fetchItems, fetchIngredients]);

  const toggleItem = async (id: number, checked: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isChecked: checked } : i)));
    await fetch("/api/shopping", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isChecked: checked }),
    });
  };

  const addItem = async (name?: string, category?: string) => {
    const itemName = name || newItem.trim();
    if (!itemName) return;
    const store = activeStore === "Wszystkie" ? "any" : activeStore.toLowerCase();
    await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: itemName, store, category }),
    });
    if (!name) setNewItem("");
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/shopping?id=${id}`, { method: "DELETE" });
  };

  const grouped = groupByCategory(items);
  const checkedCount = items.filter((i) => i.isChecked).length;

  // Catalog filtering
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = !catalogSearch || ing.name.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === "all" || ing.category === catalogCategory;
    const matchesStore = activeStore === "Wszystkie" || (
      ing.storeAvailability && JSON.parse(ing.storeAvailability).includes(activeStore.toLowerCase())
    );
    return matchesSearch && matchesCat && matchesStore;
  });

  const catalogCategories = [...new Set(ingredients.map((i) => i.category))].sort();

  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zakupy</h1>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            className={view === "list" ? "bg-green-600" : ""}
          >
            Lista
          </Button>
          <Button
            size="sm"
            variant={view === "catalog" ? "default" : "outline"}
            onClick={() => setView("catalog")}
            className={view === "catalog" ? "bg-green-600" : ""}
          >
            Katalog
          </Button>
        </div>
      </div>

      {/* Store filter */}
      <Tabs value={activeStore} onValueChange={setActiveStore}>
        <TabsList className="w-full grid grid-cols-4">
          {STORES.map((store) => (
            <TabsTrigger key={store} value={store} className="text-xs">
              {store}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {view === "list" ? (
        <>
          {/* Add item */}
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Dodaj produkt..."
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              className="flex-1"
            />
            <Button onClick={() => addItem()} className="bg-green-600 hover:bg-green-700">+</Button>
          </div>

          {/* Shopping list */}
          <div className="space-y-3">
            {items.length > 0 && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{checkedCount} / {items.length} zaznaczonych</span>
                {checkedCount > 0 && (
                  <button
                    onClick={async () => {
                      for (const item of items.filter(i => i.isChecked)) {
                        await deleteItem(item.id);
                      }
                    }}
                    className="text-destructive hover:underline"
                  >
                    Usun zaznaczone
                  </button>
                )}
              </div>
            )}

            {grouped.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Lista pusta. Przejdz do Katalogu by dodac produkty, lub wygeneruj z planu posilkow.
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
                          {item.quantity ? ` — ${item.quantity}${item.unit || ""}` : ""}
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
          </div>
        </>
      ) : (
        /* CATALOG VIEW */
        <>
          <Input
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder="Szukaj produktu..."
          />

          <div className="flex gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setCatalogCategory("all")}
              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${catalogCategory === "all" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}
            >
              Wszystkie ({ingredients.length})
            </button>
            {catalogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatalogCategory(cat)}
                className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${catalogCategory === cat ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredIngredients.map((ing) => (
              <Card key={ing.id}>
                <CardContent className="py-2 px-3">
                  <div className="flex gap-3 items-center">
                    {/* Image */}
                    {ing.imageUrl ? (
                      <img
                        src={ing.imageUrl}
                        alt={ing.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground">{ing.category}</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{ing.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {ing.caloriesPer100g} kcal | B:{ing.proteinPer100g}g T:{ing.fatPer100g}g W:{ing.carbsPer100g}g
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {ing.isGlp1Booster && <Badge className="bg-green-100 text-green-700 text-[8px] py-0 px-1">GLP-1</Badge>}
                        {ing.isAntiInflammatory && <Badge className="bg-blue-100 text-blue-700 text-[8px] py-0 px-1">Anty-zapalny</Badge>}
                      </div>
                      {ing.notes && (
                        <div className="text-[9px] text-muted-foreground mt-0.5 truncate">{ing.notes}</div>
                      )}
                    </div>

                    {/* Add button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 h-8 w-8 p-0"
                      onClick={() => addItem(ing.name, ing.category)}
                    >
                      +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIngredients.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Brak produktow pasujacych do filtrow.
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
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
    meat: "Mieso",
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
