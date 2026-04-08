import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VAPID_PUBLIC } from "@/lib/push";

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, subscription } = body;

  if (!userId || !subscription) {
    return NextResponse.json({ error: "userId and subscription required" }, { status: 400 });
  }

  // Remove existing subscriptions for this user
  db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)).run();

  // Save new subscription
  db.insert(pushSubscriptions).values({
    userId,
    subscription: JSON.stringify(subscription),
  }).run();

  return NextResponse.json({ success: true });
}
