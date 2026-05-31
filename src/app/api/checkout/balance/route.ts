import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";

export async function POST(req: NextRequest) {
  try {
    const integrations = await getIntegrations();
    if (!integrations.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 503 });
    }
    const stripe = new Stripe(integrations.stripeSecretKey, {
      apiVersion: "2023-10-16" as any,
    });

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tourPackage: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.paymentStage !== "ADVANCE_PAID") {
      return NextResponse.json({ error: "Booking is not eligible for balance payment" }, { status: 400 });
    }
    if (booking.dueAmount <= 0) {
      return NextResponse.json({ error: "No outstanding balance" }, { status: 400 });
    }

    const tour = booking.tourPackage;
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            product_data: {
              name: `${tour.name} — Balance Payment`,
              description: tour.description ?? undefined,
              images: tour.thumbnail
                ? [tour.thumbnail.startsWith("http") ? tour.thumbnail : `${process.env.NEXT_PUBLIC_APP_URL}${tour.thumbnail}`]
                : [],
            },
            unit_amount: Math.round(booking.dueAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}/invoice?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}/invoice?cancelled=true`,
      metadata: { bookingId, tourId: tour.id, userId: session.user.id, kind: "BALANCE" },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { balanceStripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Balance Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
