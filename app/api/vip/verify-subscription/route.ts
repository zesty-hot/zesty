import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Stub implementation since Stripe is removed
  return NextResponse.json({ status: "active", message: "Subscription verified (Stub)" });
}
