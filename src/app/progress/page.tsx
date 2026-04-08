"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProgressPage() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Progres</h1>

      <div className="flex gap-2">
        <Badge variant="outline" className="cursor-pointer bg-green-50 text-green-700 border-green-200">
          Kris
        </Badge>
        <Badge variant="outline" className="cursor-pointer">
          Aksana
        </Badge>
      </div>

      {/* Weight Entry */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Zapisz wage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input type="number" placeholder="np. 106.5" step="0.1" className="flex-1" />
            <Button className="bg-green-600 hover:bg-green-700">Zapisz</Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kris — statystyki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">107.0</div>
              <div className="text-xs text-muted-foreground">Aktualna</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">80.0</div>
              <div className="text-xs text-muted-foreground">Cel</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">27.0</div>
              <div className="text-xs text-muted-foreground">Do celu</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Wykres wagi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border rounded-lg border-dashed">
            Wykres pojawi sie po pierwszych wpisach
          </div>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Dzisiejsza aktywnosc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Kroki</span>
            <span className="text-sm font-medium">— (iOS Shortcut)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Trening</span>
            <Button variant="outline" size="sm">+ Dodaj trening</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
