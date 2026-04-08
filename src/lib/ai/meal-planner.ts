import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type MealPlan = {
  days: {
    day: string;
    meals: {
      type: string; // śniadanie/obiad/kolacja/przekąska
      name: string;
      ingredients: { name: string; quantity: number; unit: string }[];
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
      prepTimeMin: number;
      eatingOrderHint: string;
      tags: string[];
    }[];
  }[];
};

export async function generateWeeklyPlan(params: {
  userName: string;
  calorieTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbTarget: number;
  gender: string;
  isLutealPhase?: boolean;
}): Promise<MealPlan> {
  const { userName, calorieTarget, proteinTarget, fatTarget, carbTarget, gender, isLutealPhase } = params;

  const genderRules = gender === "F"
    ? `- Warzywa krzyżowe codziennie (brokuły, kalafior, brukselka — GOTOWANE) — DIM wspiera estrogen
- Siemię lniane 1 łyżka/dzień
- Min. ${carbTarget}g węglowodanów (ochrona tarczycy i cyklu!)
${isLutealPhase ? "- FAZA LUTEALNA: zwiększ węgle o 20-30g, więcej batatów i marchewki" : ""}`
    : `- Produkty wspierające testosteron: wołowina, jaja, czosnek, tłuste ryby
- Cynk z mięsa czerwonego i jaj`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Jesteś polskim dietetykiem. Wygeneruj plan posiłków na 7 dni dla ${userName}.

CELE DZIENNE: ~${calorieTarget} kcal, ${proteinTarget}g białka, ${fatTarget}g tłuszczu, ${carbTarget}g węgli

ZASADY DIETY:
- GLP-1: priorytet jajka, tłuste ryby, awokado, chia, zielona herbata, gorzka czekolada 70%+, błonnik
- Kolejność: białko+tłuszcz PRZED węglowodanami w każdym posiłku
- Niskie węgle: tylko jagody, bataty, ziemniaki, marchewka. ZERO makaronu, ryżu, konjaku
- Mięso: steki, karkówka, kurczak, indyk, bulion kostny
- Tłuste ryby: łosoś, sardynki, makrela, śledź — min. 3x w tygodniu
- Wątróbka (wołowa lub drobiowa) — 1-2x w tygodniu
- ZERO: olej roślinny (oprócz oliwy EVOO), soja, przetworzone jedzenie
- Nabiał: kozie mleko, jajka zero, sery bez laktozy, mascarpone, twaróg
- Fermentowane: kiszona kapusta do posiłków, sok z kiszonego buraka
- Tłuszcze: masło, smalec, oliwa z oliwek EVOO, olej kokosowy
- Przyprawy: kurkuma+pieprz, imbir, czosnek, cynamon cejloński, tymianek, oregano, natka pietruszki
- Słodkie: mascarpone bez laktozy, twaróg z chia i miodem spadziowym, gorzka czekolada 85%
- Antyrefluksowe: kolacja możliwa do zjedzenia przed 19:00
- Przeciwzapalne: maksymalizuj produkty obniżające CRP
${genderRules}

TAGI na posiłkach (przypisz odpowiednie):
GLP-1, Przeciwzapalny, T-boost, Hormony, Omega-3, Folian, Fermented, Bone-broth

Zwróć TYLKO JSON (bez markdown):
{
  "days": [
    {
      "day": "Poniedziałek",
      "meals": [
        {
          "type": "śniadanie",
          "name": "Jajecznica z awokado i kurkumą",
          "ingredients": [{"name": "jajka", "quantity": 3, "unit": "szt"}, ...],
          "calories": 450, "protein": 30, "fat": 35, "carbs": 8, "fiber": 5,
          "prepTimeMin": 10,
          "eatingOrderHint": "Jedz jajka i awokado pierwsze",
          "tags": ["GLP-1", "Przeciwzapalny", "T-boost"]
        }
      ]
    }
  ]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON");
  }

  return JSON.parse(jsonMatch[0]) as MealPlan;
}
