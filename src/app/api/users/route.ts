import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const allUsers = db.select().from(users).all();
  // Don't expose pin hash
  const safe = allUsers.map(({ pinHash, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  db.update(users).set(updates).where(eq(users.id, id)).run();
  const updated = db.select().from(users).where(eq(users.id, id)).get();
  return NextResponse.json(updated);
}
