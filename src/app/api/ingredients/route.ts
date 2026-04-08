import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingredients } from "@/lib/db/schema";
import { like } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const store = searchParams.get("store");
  const search = searchParams.get("q");

  let results = db.select().from(ingredients).all();

  if (category) {
    results = results.filter((i) => i.category === category);
  }
  if (store) {
    results = results.filter((i) => {
      const stores = i.storeAvailability ? JSON.parse(i.storeAvailability) : [];
      return stores.includes(store.toLowerCase());
    });
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((i) => i.name.toLowerCase().includes(q));
  }

  return NextResponse.json(results);
}
