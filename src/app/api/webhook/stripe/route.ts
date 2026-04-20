import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.bookingId) {
        db.prepare("UPDATE booking SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
          .run("paid", metadata.bookingId);
      }
      break;
    
    case "checkout.session.expired":
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const expiredMetadata = expiredSession.metadata;

      if (expiredMetadata?.bookingId) {
        db.prepare("UPDATE booking SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
          .run("cancelled", expiredMetadata.bookingId);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
