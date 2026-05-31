import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PHOTOS = 5;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: { rating?: number; comment?: string | null; photos?: string | null } = {};

  if (body?.rating !== undefined) {
    const r = Number(body.rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
    }
    data.rating = Math.round(r);
  }
  if (body?.comment !== undefined) {
    data.comment =
      typeof body.comment === "string" && body.comment.trim() ? body.comment.trim() : null;
  }
  if (body?.photos !== undefined) {
    const arr = Array.isArray(body.photos)
      ? (body.photos as unknown[])
          .filter((u): u is string => typeof u === "string" && !!u)
          .slice(0, MAX_PHOTOS)
      : [];
    data.photos = arr.length ? arr.join(",") : null;
  }

  const review = await prisma.review.update({ where: { id }, data });
  return NextResponse.json({ review });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }
  if (existing.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
