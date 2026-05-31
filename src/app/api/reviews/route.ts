import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/utils";

const MAX_PHOTOS = 5;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tourPackageId: unknown = body?.tourPackageId;
  const ratingRaw: unknown = body?.rating;
  const commentRaw: unknown = body?.comment;
  const photosRaw: unknown = body?.photos;

  if (typeof tourPackageId !== "string" || !tourPackageId) {
    return NextResponse.json({ error: "Tour ID is required" }, { status: 400 });
  }
  const rating = Number(ratingRaw);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }
  const comment =
    typeof commentRaw === "string" && commentRaw.trim() ? commentRaw.trim() : null;
  const photos = Array.isArray(photosRaw)
    ? (photosRaw as unknown[])
        .filter((u): u is string => typeof u === "string" && !!u)
        .slice(0, MAX_PHOTOS)
    : [];

  const eligibleBooking = await prisma.booking.findFirst({
    where: {
      userId: session.user.id,
      tourPackageId,
      paymentStage: { in: ["ADVANCE_PAID", "FULLY_PAID"] },
    },
    select: { id: true },
  });

  if (!eligibleBooking) {
    return NextResponse.json(
      {
        error: "NOT_ELIGIBLE",
        message: "Only paying customers can review this tour.",
      },
      { status: 403 },
    );
  }

  const existing = await prisma.review.findUnique({
    where: { userId_tourPackageId: { userId: session.user.id, tourPackageId } },
  });

  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: Math.round(rating),
          comment,
          photos: photos.length ? photos.join(",") : null,
        },
      })
    : await prisma.review.create({
        data: {
          id: generateOrderId(),
          tourPackageId,
          userId: session.user.id,
          rating: Math.round(rating),
          comment,
          photos: photos.length ? photos.join(",") : null,
          reviewerName: session.user.name ?? null,
          reviewerImage: session.user.image ?? null,
        },
      });

  return NextResponse.json({ review });
}
