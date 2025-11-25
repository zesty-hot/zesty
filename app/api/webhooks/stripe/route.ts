import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded":
      const invoice = event.data.object as any;
      // Activate subscription
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        // Find subscription by stripe ID or metadata
        // Since we didn't save stripeSubscriptionId yet (it was just created), we might need to rely on metadata from the subscription object
        // But wait, we can get the subscription from Stripe to get metadata

        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const { vipPageId, subscriberId } = stripeSub.metadata;

        if (vipPageId && subscriberId) {
          // Create or update local subscription
          const currentPeriodEnd = (stripeSub as any).current_period_end;
          await prisma.vIPSubscription.upsert({
            where: {
              subscriberId_vipPageId: {
                subscriberId,
                vipPageId,
              },
            },
            update: {
              active: true,
              stripeSubscriptionId: subscriptionId,
              amountPaid: invoice.amount_paid,
              expiresAt: new Date(currentPeriodEnd * 1000),
            },
            create: {
              subscriberId,
              vipPageId,
              active: true,
              stripeSubscriptionId: subscriptionId,
              amountPaid: invoice.amount_paid,
              expiresAt: new Date(currentPeriodEnd * 1000),
            },
          });
        }
      }
      break;
    case "customer.subscription.deleted":
      const deletedSub = event.data.object as Stripe.Subscription;
      // Deactivate subscription
      // We can find by stripeSubscriptionId
      const sub = await prisma.vIPSubscription.findFirst({
        where: { stripeSubscriptionId: deletedSub.id }
      });
      if (sub) {
        await prisma.vIPSubscription.update({
          where: { id: sub.id },
          data: { active: false }
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
