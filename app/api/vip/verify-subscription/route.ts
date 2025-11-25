import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: Request) {
  try {
    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    // 1. Auth check
    const supaBase = await serverSupabase();
    const { data: { user: authUser } } = await supaBase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Retrieve Subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    });
    console.log(`[Verify] Retrieved subscription ${subscriptionId}, status: ${subscription.status}`);

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // 3. Verify ownership (optional but good practice)
    // We can check if the customer ID matches the user's stripeId, but we need to fetch the user first.
    // For now, we'll rely on the fact that we're updating the DB based on the subscription's metadata.

    const { vipPageId, subscriberId } = subscription.metadata;
    console.log(`[Verify] Metadata - vipPageId: ${vipPageId}, subscriberId: ${subscriberId}`);

    if (!vipPageId || !subscriberId) {
      return NextResponse.json({ error: "Invalid subscription metadata" }, { status: 400 });
    }

    // 4. Check status and update DB
    // We consider 'active' or 'trialing' as active. 
    // We also check for 'incomplete' if the payment intent is succeeded (common in immediate verification)

    let isActive = subscription.status === 'active' || subscription.status === 'trialing';
    let amountPaid = 0;

    if (!isActive && subscription.status === 'incomplete') {
      const invoice = subscription.latest_invoice as any;
      if (invoice && invoice.payment_intent && invoice.payment_intent.status === 'succeeded') {
        console.log(`[Verify] Subscription is incomplete but payment succeeded. Marking as active.`);
        isActive = true;
      }
    }

    if (isActive) {
      // Fallback to 30 days from now if current_period_end is missing (shouldn't happen usually)
      const currentPeriodEnd = (subscription as any).current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      console.log(`[Verify] current_period_end: ${currentPeriodEnd}`);
      if (!(subscription as any).current_period_end) {
        console.log(`[Verify] WARNING: current_period_end missing. Keys: ${Object.keys(subscription)}`);
      }

      if (subscription.latest_invoice) {
        const invoice = subscription.latest_invoice as any;
        amountPaid = invoice.amount_paid || 0;
      }

      await prisma.vIPSubscription.upsert({
        where: {
          subscriberId_vipPageId: {
            subscriberId,
            vipPageId,
          },
        },
        update: {
          active: true,
          stripeSubscriptionId: subscription.id,
          amountPaid: amountPaid,
          expiresAt: new Date(currentPeriodEnd * 1000),
        },
        create: {
          subscriberId,
          vipPageId,
          active: true,
          stripeSubscriptionId: subscription.id,
          amountPaid: amountPaid,
          expiresAt: new Date(currentPeriodEnd * 1000),
        },
      });

      console.log(`[Verify] DB updated successfully.`);

      return NextResponse.json({ status: "active", message: "Subscription verified" });
    } else {
      console.log(`[Verify] Subscription NOT active. Status: ${subscription.status}`);
      return NextResponse.json({ status: subscription.status, message: "Subscription not active" });
    }

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
