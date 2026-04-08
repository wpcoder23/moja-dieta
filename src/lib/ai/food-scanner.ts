import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type FoodScanResult = {
  items: {
    name: string;
    grams: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  }[];
  total: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  isGlp1Friendly: boolean;
  isAntiInflammatory: boolean;
  eatingOrderHint: string;
};

export async function scanFood(imageBase64: string, mimeType: string): Promise<FoodScanResult> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Jesteś analitykiem żywienia. Na podstawie zdjęcia jedzenia oszacuj:

1. Widoczne produkty (po polsku)
2. Szacowana porcja w gramach
3. Kalorie, białko, tłuszcz, węgle, błonnik per produkt i suma
4. Czy posiłek jest GLP-1 friendly (białko/tłuszcz/błonnik → stymulują GLP-1)
5. Czy posiłek jest przeciwzapalny (tłuste ryby, kurkuma, oliwa, jagody, warzywa)
6. Wskazówka kolejności jedzenia (białko+tłuszcz PRZED węglowodanami)

Zwróć TYLKO JSON (bez markdown):
{
  "items": [{"name": "...", "grams": 200, "calories": 500, "protein": 50, "fat": 30, "carbs": 0, "fiber": 0}],
  "total": {"calories": 500, "protein": 50, "fat": 30, "carbs": 0, "fiber": 0},
  "isGlp1Friendly": true,
  "isAntiInflammatory": false,
  "eatingOrderHint": "Jedz mięso i warzywa pierwsze, potem ziemniaki"
}

Bądź konserwatywny w szacunkach.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON");
  }

  return JSON.parse(jsonMatch[0]) as FoodScanResult;
}
