import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import crypto from "node:crypto";
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

    const { tourId } = await req.json();
    if (!tourId) {
      return NextResponse.json({ error: "Tour ID is required" }, { status: 400 });
    }

    const userRow = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });
    if (!userRow?.phone) {
      return NextResponse.json(
        { error: "PHONE_REQUIRED", message: "Please add a phone number to your account before booking." },
        { status: 422 },
      );
    }

    const tour = await prisma.tourPackage.findUnique({ where: { id: tourId } });
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const bookingId = crypto.randomUUID();

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: (integrations.stripeCurrency || "usd").toLowerCase(),
            product_data: {
              name: tour.name,
              description: tour.description ?? undefined,
              images: tour.thumbnail
                ? [tour.thumbnail.startsWith("http") ? tour.thumbnail : `${process.env.NEXT_PUBLIC_APP_URL}${tour.thumbnail}`]
                : [],
            },
            unit_amount: Math.round(tour.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings/${bookingId}/invoice?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${tourId}?cancelled=true`,
      metadata: { bookingId, tourId, userId: session.user.id },
    });

    await prisma.booking.create({
      data: {
        id: bookingId,
        userId: session.user.id,
        tourPackageId: tourId,
        amount: tour.price,
        currency: (integrations.stripeCurrency || "usd").toLowerCase(),
        status: "pending",
        stripeSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
