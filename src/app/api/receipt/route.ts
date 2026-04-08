import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type ReceiptItem = {
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

export type ReceiptScanResult = {
  store: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  dietSummary: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "imageBase64 and mimeType required" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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
              text: `Odczytaj ten paragon ze sklepu spożywczego. Dla każdego produktu oceń czy pasuje do diety:

ZASADY DIETY:
- TAK: mięso (wołowina, kurczak, indyk, karkówka), ryby (łosoś, tuńczyk, makrela), jajka bio, nabiał bez laktozy (ser, kefir, twaróg, mascarpone, halloumi, burrata), warzywa, owoce z niską pestycydowością, oliwa z oliwek, masło, smalec, kiszonki, przyprawy, czekolada gorzka 70%+, miód spadziowy, awokado
- NIE: makaron, ryż, chleb, oleje roślinne (oprócz oliwy), soja, przetworzone jedzenie, sosy gotowe, chipsy, słodycze, napoje gazowane, alkohol

Zwróć TYLKO JSON:
{
  "store": "Lidl",
  "date": "2026-03-18",
  "total": 433.62,
  "items": [
    {
      "name": "BIO Jaja M.L",
      "quantity": 1,
      "price": 15.99,
      "fitsDiet": true,
      "reason": "Jajka bio - podstawa diety",
      "category": "dairy",
      "estimatedCaloriesPer100g": 155,
      "estimatedProteinPer100g": 13,
      "estimatedFatPer100g": 11,
      "estimatedCarbsPer100g": 1
    }
  ],
  "dietSummary": "15 z 20 produktów pasuje do diety. Niepasujące: makaron, chleb..."
}

Bądź dokładny w odczytywaniu cen i nazw. Oszacuj makro per 100g dla każdego produktu.`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error("Receipt scan error:", error);
    return NextResponse.json(
      { error: "Receipt scan failed", details: String(error) },
      { status: 500 }
    );
  }
}
