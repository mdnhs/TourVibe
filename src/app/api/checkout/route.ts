import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";
import { generateOrderId } from "@/lib/utils";
import { isValidE164, normalizeWhatsapp } from "@/lib/whatsapp";
import {
  findVehicleConflict,
  VEHICLE_UNAVAILABLE_MESSAGE,
} from "@/lib/availability";

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
    const body = await req.json();
    const {
      tourId,
      paymentType: rawPaymentType,
      guestName,
      guestEmail,
      whatsapp: bodyWhatsapp,
      vehicleId,
      startTime: startTimeRaw,
    } = body;

    if (!tourId) {
      return NextResponse.json({ error: "Tour ID is required" }, { status: 400 });
    }
    if (!vehicleId || typeof vehicleId !== "string") {
      return NextResponse.json({ error: "Vehicle is required" }, { status: 400 });
    }
    if (!startTimeRaw || typeof startTimeRaw !== "string") {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 });
    }
    const startTime = new Date(startTimeRaw);
    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
    }
    if (startTime.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Start time must be in the future" },
        { status: 400 },
      );
    }

    const paymentType: "ADVANCE" | "FULL" = rawPaymentType === "ADVANCE" ? "ADVANCE" : "FULL";

    let userId: string | null = null;
    let bookingWhatsapp: string | null = null;
    let bookingGuestName: string | null = null;
    let bookingGuestEmail: string | null = null;

    if (session?.user) {
      const userRow = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { whatsapp: true },
      });
      let whatsappToUse = userRow?.whatsapp ?? null;

      if (typeof bodyWhatsapp === "string" && bodyWhatsapp.trim()) {
        const normalized = normalizeWhatsapp(bodyWhatsapp);
        if (!isValidE164(normalized)) {
          return NextResponse.json(
            { error: "WhatsApp number must be in international format, e.g. +14155551234" },
            { status: 400 },
          );
        }
        whatsappToUse = normalized;
        if (whatsappToUse !== userRow?.whatsapp) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { whatsapp: whatsappToUse },
          });
        }
      }

      if (!whatsappToUse) {
        return NextResponse.json(
          {
            error: "WHATSAPP_REQUIRED",
            message: "Please add an active WhatsApp number to your account before booking.",
          },
          { status: 422 },
        );
      }

      userId = session.user.id;
      bookingWhatsapp = whatsappToUse;
    } else {
      const normalized = typeof bodyWhatsapp === "string" ? normalizeWhatsapp(bodyWhatsapp) : "";
      if (!guestName || typeof guestName !== "string" || !guestName.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      if (!isValidE164(normalized)) {
        return NextResponse.json(
          { error: "WhatsApp number must be in international format, e.g. +14155551234" },
          { status: 400 },
        );
      }
      if (
        typeof guestEmail === "string" &&
        guestEmail.trim() &&
        !/^\S+@\S+\.\S+$/.test(guestEmail.trim())
      ) {
        return NextResponse.json({ error: "Email is not valid" }, { status: 400 });
      }

      bookingWhatsapp = normalized;
      bookingGuestName = guestName.trim();
      bookingGuestEmail =
        typeof guestEmail === "string" && guestEmail.trim() ? guestEmail.trim() : null;
    }

    const tour = await prisma.tourPackage.findUnique({
      where: { id: tourId },
      include: { vehicles: { select: { vehicleId: true } } },
    });
    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const vehicleAssigned = tour.vehicles.some((v) => v.vehicleId === vehicleId);
    if (!vehicleAssigned) {
      return NextResponse.json(
        { error: "Selected vehicle is not assigned to this tour" },
        { status: 400 },
      );
    }

    const durationHours = tour.durationHours || 1;
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

    // Pre-check (fast path, avoids creating Stripe session for obvious conflicts)
    const preConflict = await findVehicleConflict(prisma, {
      vehicleId,
      start: startTime,
      end: endTime,
    });
    if (preConflict) {
      return NextResponse.json(
        { error: "VEHICLE_UNAVAILABLE", message: VEHICLE_UNAVAILABLE_MESSAGE },
        { status: 409 },
      );
    }

    const totalAmount = Math.round(tour.price * 100) / 100;
    const chargeAmount =
      paymentType === "ADVANCE"
        ? Math.round(totalAmount * 0.2 * 100) / 100
        : totalAmount;

    const bookingId = generateOrderId();
    const productLabel =
      paymentType === "ADVANCE" ? `${tour.name} — 20% Advance` : tour.name;

    const stripeCustomerEmail =
      session?.user?.email ?? bookingGuestEmail ?? undefined;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      ...(stripeCustomerEmail ? { customer_email: stripeCustomerEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: (integrations.stripeCurrency || "usd").toLowerCase(),
            product_data: {
              name: productLabel,
              description: tour.description ?? undefined,
              images: tour.thumbnail
                ? [
                    tour.thumbnail.startsWith("http")
                      ? tour.thumbnail
                      : `${process.env.NEXT_PUBLIC_APP_URL}${tour.thumbnail}`,
                  ]
                : [],
            },
            unit_amount: Math.round(chargeAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tours/${tour.slug}?cancelled=true`,
      metadata: {
        bookingId,
        tourId,
        userId: userId ?? "",
        kind: paymentType,
        ...(bookingGuestName ? { guestName: bookingGuestName } : {}),
      },
    });

    try {
      await prisma.$transaction(async (tx) => {
        const conflict = await findVehicleConflict(tx, {
          vehicleId,
          start: startTime,
          end: endTime,
        });
        if (conflict) {
          throw new Error("VEHICLE_UNAVAILABLE");
        }

        await tx.booking.create({
          data: {
            id: bookingId,
            userId,
            tourPackageId: tourId,
            vehicleId,
            startTime,
            endTime,
            amount: chargeAmount,
            totalAmount,
            paidAmount: 0,
            dueAmount: totalAmount,
            paymentType,
            paymentStage: "UNPAID",
            currency: (integrations.stripeCurrency || "usd").toLowerCase(),
            status: "unpaid",
            whatsapp: bookingWhatsapp,
            guestName: bookingGuestName,
            guestEmail: bookingGuestEmail,
            stripeSessionId: stripeSession.id,
          },
        });
      });
    } catch (err: any) {
      // Expire orphan Stripe session on conflict
      try {
        await stripe.checkout.sessions.expire(stripeSession.id);
      } catch {
        /* ignore */
      }
      if (err?.message === "VEHICLE_UNAVAILABLE") {
        return NextResponse.json(
          { error: "VEHICLE_UNAVAILABLE", message: VEHICLE_UNAVAILABLE_MESSAGE },
          { status: 409 },
        );
      }
      throw err;
    }

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
