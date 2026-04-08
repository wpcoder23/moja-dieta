"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Pon", "Wt", "Sr", "Czw", "Pt", "Sob", "Nd"];

export default function PlanPage() {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plan posilkow</h1>
        <button className="text-sm text-green-600 font-medium">
          + Generuj AI
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day, i) => (
          <button
            key={day}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              i === 0
                ? "bg-green-600 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <MealSlot
          type="Sniadanie"
          name="Jajecznica z awokado i kurkuma"
          calories={450}
          protein={30}
          tags={["GLP-1", "Przeciwzapalny", "T-boost"]}
          hint="Jedz jajka i awokado pierwsze"
        />
        <MealSlot
          type="Obiad"
          name="Stek wolowy z batatami i brokulami"
          calories={680}
          protein={55}
          tags={["GLP-1", "T-boost", "Hormony"]}
          hint="Stek i brokuły przed batatami"
        />
        <MealSlot
          type="Kolacja"
          name="Losos z kiszona kapusta"
          calories={520}
          protein={42}
          tags={["GLP-1", "Przeciwzapalny", "Omega-3"]}
          hint="Zjedz przed 19:00"
        />
        <MealSlot
          type="Przekaska"
          name="Twarog z chia i miodem spadziowym"
          calories={280}
          protein={20}
          tags={["Ca", "Blonnik"]}
        />
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Suma: 1930 kcal | B: 147g | T: 108g | W: 72g
        </CardContent>
      </Card>
    </div>
  );
}

function MealSlot({ type, name, calories, protein, tags, hint }: {
  type: string; name: string; calories: number; protein: number; tags: string[]; hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
            {type}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{calories} kcal</span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="font-medium text-sm">{name}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5">
              {tag}
            </Badge>
          ))}
        </div>
        {hint && (
          <p className="text-[10px] text-green-600 mt-1.5">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
