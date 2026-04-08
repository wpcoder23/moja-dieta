import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shoppingListItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const store = searchParams.get("store");

  let items = db.select().from(shoppingListItems).all();
  if (store && store !== "all") {
    items = items.filter((i) => i.store === store.toLowerCase() || i.store === "any");
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, quantity, unit, store, category, notes } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const result = db
    .insert(shoppingListItems)
    .values({
      name,
      quantity: quantity || null,
      unit: unit || null,
      store: store || "any",
      category: category || null,
      notes: notes || null,
      isChecked: false,
    })
    .run();

  return NextResponse.json({ id: result.lastInsertRowid, name, store });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, isChecked } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  db.update(shoppingListItems)
    .set({ isChecked })
    .where(eq(shoppingListItems.id, id))
    .run();

  return NextResponse.json({ id, isChecked });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  db.delete(shoppingListItems).where(eq(shoppingListItems.id, Number(id))).run();
  return NextResponse.json({ deleted: true });
}
