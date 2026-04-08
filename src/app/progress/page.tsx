"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

type WeightLog = {
  id: number;
  weight: number;
  loggedAt: string;
  note: string | null;
};

type User = {
  id: number;
  name: string;
  currentWeight: number | null;
  targetWeight: number | null;
  heightCm: number | null;
};

export default function ProgressPage() {
  const [activeUser, setActiveUser] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [usersRes, logsRes] = await Promise.all([
      fetch("/api/users"),
      fetch(`/api/weight?userId=${activeUser}`),
    ]);
    setUsers(await usersRes.json());
    setLogs(await logsRes.json());
  }, [activeUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveWeight = async () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w < 30 || w > 300) return;
    setSaving(true);
    await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser, weight: w }),
    });
    setNewWeight("");
    setSaving(false);
    fetchData();
  };

  const user = users.find((u) => u.id === activeUser);
  const current = logs[0]?.weight || user?.currentWeight || 0;
  const target = user?.targetWeight || 0;
  const toGo = Math.max(0, current - target);
  const heightM = (user?.heightCm || 180) / 100;
  const bmi = current > 0 ? (current / (heightM * heightM)).toFixed(1) : "—";

  // Chart data (reverse for chronological order)
  const chartData = [...logs].reverse().map((l) => ({
    date: l.loggedAt.slice(5), // MM-DD
    weight: l.weight,
  }));

  // Weekly change
  const weekAgo = logs.find((l) => {
    const d = new Date(l.loggedAt);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 6;
  });
  const weeklyChange = weekAgo ? (current - weekAgo.weight).toFixed(1) : null;

  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-2xl font-bold">Progres</h1>

      <div className="flex gap-2">
        {users.map((u) => (
          <Badge
            key={u.id}
            variant="outline"
            className={`cursor-pointer ${activeUser === u.id ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            onClick={() => setActiveUser(u.id)}
          >
            {u.name}
          </Badge>
        ))}
      </div>

      {/* Weight Entry */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Zapisz wage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="np. 106.5"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveWeight()}
              className="flex-1"
            />
            <Button
              onClick={saveWeight}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "..." : "Zapisz"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-xl font-bold">{current.toFixed(1)}</div>
              <div className="text-[10px] text-muted-foreground">Aktualna</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{target}</div>
              <div className="text-[10px] text-muted-foreground">Cel</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">{toGo.toFixed(1)}</div>
              <div className="text-[10px] text-muted-foreground">Do celu</div>
            </div>
            <div>
              <div className="text-xl font-bold">{bmi}</div>
              <div className="text-[10px] text-muted-foreground">BMI</div>
            </div>
          </div>
          {weeklyChange && (
            <div className="text-center mt-2">
              <span className={`text-sm font-medium ${parseFloat(weeklyChange) <= 0 ? "text-green-600" : "text-red-600"}`}>
                {parseFloat(weeklyChange) <= 0 ? "" : "+"}{weeklyChange} kg/tydzien
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Wykres wagi</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground border rounded-lg border-dashed">
              Wykres pojawi sie po 2+ wpisach
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={target} stroke="#16a34a" strokeDasharray="5 5" label={{ value: "Cel", fontSize: 10 }} />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ostatnie wpisy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {logs.slice(0, 10).map((l) => (
              <div key={l.id} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                <span className="text-muted-foreground">{l.loggedAt}</span>
                <span className="font-medium">{l.weight} kg</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
