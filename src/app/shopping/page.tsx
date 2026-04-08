"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const STORES = ["Wszystkie", "Lidl", "Biedronka", "Auchan"];

const MOCK_ITEMS = [
  { id: 1, name: "Steki wolowe", category: "Mieso", store: "lidl", checked: false },
  { id: 2, name: "Losos", category: "Ryby", store: "lidl", checked: false },
  { id: 3, name: "Jajka zero (10szt)", category: "Nabiał", store: "biedronka", checked: false },
  { id: 4, name: "Kozie mleko", category: "Nabiał", store: "biedronka", checked: false },
  { id: 5, name: "Bataty", category: "Warzywa", store: "lidl", checked: false },
  { id: 6, name: "Brokuły", category: "Warzywa", store: "auchan", checked: false },
  { id: 7, name: "Jagody mrozone", category: "Owoce", store: "biedronka", checked: false },
  { id: 8, name: "Awokado", category: "Owoce", store: "lidl", checked: false },
  { id: 9, name: "Kiszona kapusta", category: "Fermentowane", store: "biedronka", checked: false },
  { id: 10, name: "Oliwa z oliwek EVOO", category: "Tłuszcze", store: "lidl", checked: false },
];

export default function ShoppingPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Lista zakupow</h1>

      <Tabs defaultValue="Wszystkie">
        <TabsList className="w-full grid grid-cols-4">
          {STORES.map((store) => (
            <TabsTrigger key={store} value={store} className="text-xs">
              {store}
            </TabsTrigger>
          ))}
        </TabsList>

        {STORES.map((store) => (
          <TabsContent key={store} value={store} className="space-y-2 mt-4">
            {groupByCategory(
              store === "Wszystkie"
                ? MOCK_ITEMS
                : MOCK_ITEMS.filter((i) => i.store === store.toLowerCase())
            ).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  {category}
                </h3>
                {items.map((item) => (
                  <Card key={item.id} className="mb-1">
                    <CardContent className="py-2 px-3 flex items-center gap-3">
                      <Checkbox />
                      <span className="text-sm">{item.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function groupByCategory(items: typeof MOCK_ITEMS): [string, typeof MOCK_ITEMS][] {
  const groups: Record<string, typeof MOCK_ITEMS> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return Object.entries(groups);
}
