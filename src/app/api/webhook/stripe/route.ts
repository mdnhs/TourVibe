import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";
import { generateOrderId } from "@/lib/utils";

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
      const bookingId = session.metadata?.bookingId;
      const kind = session.metadata?.kind ?? "FULL";
      if (!bookingId) break;

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tourPackage: { select: { name: true } } },
      });
      if (!booking) break;

      const paidNow = (session.amount_total ?? 0) / 100;
      const newPaidAmount = Math.round((booking.paidAmount + paidNow) * 100) / 100;
      const newDueAmount = Math.max(
        0,
        Math.round((booking.totalAmount - newPaidAmount) * 100) / 100,
      );

      let paymentStage: "ADVANCE_PAID" | "FULLY_PAID";
      let status: string;
      if (kind === "ADVANCE" && newDueAmount > 0) {
        paymentStage = "ADVANCE_PAID";
        status = "advance_paid";
      } else {
        paymentStage = "FULLY_PAID";
        status = "paid";
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          paymentStage,
          status,
        },
      });

      const tourName = booking.tourPackage?.name ?? "your tour";
      const notifTitle =
        paymentStage === "FULLY_PAID"
          ? "Booking confirmed"
          : "Advance payment received";
      const notifBody =
        paymentStage === "FULLY_PAID"
          ? `Payment received for ${tourName}. Booking ${bookingId} is confirmed.`
          : `20% advance received for ${tourName}. Balance ${newDueAmount.toFixed(2)} ${booking.currency.toUpperCase()} due before tour date.`;

      await prisma.notification.create({
        data: {
          id: generateOrderId(),
          title: notifTitle,
          body: notifBody,
          type: "booking",
          targetUserId: booking.userId,
          createdBy: "system",
        },
      });
      break;
    }
    case "checkout.session.expired": {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const bookingId = expiredSession.metadata?.bookingId;
      const kind = expiredSession.metadata?.kind ?? "FULL";
      if (!bookingId) break;
      if (kind === "BALANCE") {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { balanceStripeSessionId: null },
        });
      } else {
        await prisma.booking.update({
          where: { id: bookingId },
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
