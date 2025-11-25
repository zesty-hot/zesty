import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any, // Force version to avoid TS errors if types mismatch
});

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

    // 5. Handle Paid Subscription (Stripe)

    // Ensure user has Stripe Customer ID
    let stripeCustomerId = user.stripeId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: authUser.email || undefined,
        metadata: {
          zesty_id: user.zesty_id,
          supabase_id: user.supabaseId,
        },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { zesty_id: user.zesty_id },
        data: { stripeId: stripeCustomerId },
      });
    }

    // Create Stripe Subscription
    // First create a price for this subscription
    // We create a new price object to ensure it matches the current VIP page settings
    // In a production app, we might want to cache this or store stripePriceId on the VIPPage model
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: vipPage.subscriptionPrice,
      recurring: {
        interval: "month",
      },
      product_data: {
        name: `Subscription to ${vipPage.user.title || vipPage.user.slug || "VIP Content"}`,
        metadata: {
          vipPageId: vipPage.id,
        },
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        vipPageId: vipPage.id,
        subscriberId: user.zesty_id,
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new Error("Failed to create payment intent");
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
    });

  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
