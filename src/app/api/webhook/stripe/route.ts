import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";

export async function POST(req: NextRequest) {
  const integrations = await getIntegrations();

  if (!integrations.stripeSecretKey || !integrations.stripeWebhookSecret) {
    console.error("Stripe webhook: credentials not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(integrations.stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, integrations.stripeWebhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.bookingId) {
        await prisma.booking.update({
          where: { id: session.metadata.bookingId },
          data: { status: "paid" },
        });
      }
      break;
    }
    case "checkout.session.expired": {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      if (expiredSession.metadata?.bookingId) {
        await prisma.booking.update({
          where: { id: expiredSession.metadata.bookingId },
          data: { status: "cancelled" },
        });
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
