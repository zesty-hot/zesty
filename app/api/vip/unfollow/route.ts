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

    // 2. Find Subscription
    const subscription = await prisma.vIPSubscription.findUnique({
      where: {
        subscriberId_vipPageId: {
          subscriberId: user.zesty_id,
          vipPageId: vipPageId,
        },
      },
      include: {
        vipPage: true,
      }
    });

    if (!subscription || !subscription.active) {
      return NextResponse.json({ message: "Not subscribed" }, { status: 200 });
    }

    // 3. Handle Unfollow/Unsubscribe

    // Stripe cancellation removed


    // Deactivate local subscription
    await prisma.vIPSubscription.update({
      where: { id: subscription.id },
      data: {
        active: false,
        expiresAt: new Date(), // Expire immediately or keep until end of period? 
        // Usually for "unfollow" we might want immediate effect, but for paid subs we might want to keep it until end of period.
        // For now, let's just mark as inactive to stop access.
        // If we want "cancel at period end", we'd need different logic.
        // The user asked for "unfollow", implying immediate action.
      },
    });

    return NextResponse.json({ message: "Unfollowed successfully" });

  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
