import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";
// Stripe removed


export async function POST(request: Request) {
  try {
    const { vipPageId } = await request.json();

    if (!vipPageId) {
      return NextResponse.json({ error: "VIP Page ID is required" }, { status: 400 });
    }

    // 1. Auth check
    const supaBase = await serverSupabase();
    const { data: { user: authUser } } = await supaBase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get DB user
    const user = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Get VIP Page details
    const vipPage = await prisma.vIPPage.findUnique({
      where: { id: vipPageId },
      include: { user: true }
    });

    if (!vipPage) {
      return NextResponse.json({ error: "VIP Page not found" }, { status: 404 });
    }

    // 3. Check existing subscription
    const existingSub = await prisma.vIPSubscription.findUnique({
      where: {
        subscriberId_vipPageId: {
          subscriberId: user.zesty_id,
          vipPageId: vipPage.id,
        },
      },
    });

    if (existingSub && existingSub.active) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
    }

    // 4. Handle Free Subscription
    if (vipPage.isFree) {
      if (existingSub) {
        // Reactivate if exists
        await prisma.vIPSubscription.update({
          where: { id: existingSub.id },
          data: { active: true, expiresAt: null },
        });
      } else {
        // Create new
        await prisma.vIPSubscription.create({
          data: {
            subscriberId: user.zesty_id,
            vipPageId: vipPage.id,
            active: true,
            amountPaid: 0,
          },
        });
      }
      return NextResponse.json({ status: "active", message: "Followed successfully" });
    }

    // 5. Handle Paid Subscription (Mock)
    // Directly create the subscription without payment
    await prisma.vIPSubscription.create({
      data: {
        subscriberId: user.zesty_id,
        vipPageId: vipPage.id,
        active: true,
        amountPaid: vipPage.subscriptionPrice,
        // No stripeSubscriptionId
      },
    });

    return NextResponse.json({
      status: "active",
      message: "Subscribed successfully (Mock)",
    });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
