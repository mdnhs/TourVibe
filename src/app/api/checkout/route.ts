import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";
import crypto from "node:crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tourId } = await req.json();

    if (!tourId) {
      return NextResponse.json({ error: "Tour ID is required" }, { status: 400 });
    }

    // Phone is mandatory for booking
    const userRow = db
      .prepare("SELECT phone FROM user WHERE id = ?")
      .get(session.user.id) as { phone: string | null } | undefined;
    if (!userRow?.phone) {
      return NextResponse.json(
        { error: "PHONE_REQUIRED", message: "Please add a phone number to your account before booking." },
        { status: 422 },
      );
    }

    const tour = db.prepare("SELECT * FROM tour_package WHERE id = ?").get(tourId) as any;

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const bookingId = crypto.randomUUID();

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tour.name,
              description: tour.description,
              images: tour.thumbnail ? [tour.thumbnail.startsWith("http") ? tour.thumbnail : `${process.env.NEXT_PUBLIC_APP_URL}${tour.thumbnail}`] : [],
            },
            unit_amount: Math.round(tour.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${tourId}?cancelled=true`,
      metadata: {
        bookingId,
        tourId,
        userId: session.user.id,
      },
    });

    db.prepare(`
      INSERT INTO booking (id, userId, tourPackageId, amount, status, stripeSessionId)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(bookingId, session.user.id, tourId, tour.price, "pending", stripeSession.id);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
