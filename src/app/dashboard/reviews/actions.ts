"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";

export async function createReview(formData: FormData) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  const tourPackageId = formData.get("tourPackageId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  let reviewerName = session.user.name;
  let reviewerImage = session.user.image ?? null;

  if (isSuperAdmin) {
    const customName = formData.get("reviewerName") as string;
    const customImageFile = formData.get("reviewerImage") as File | null;
    if (customName) reviewerName = customName;
    if (customImageFile && customImageFile.size > 0) {
      reviewerImage = await uploadToCloudinary(customImageFile, "tourvibe/reviews");
    }
  }

  if (!tourPackageId || isNaN(rating)) {
    return { error: "Missing required fields" };
  }

  try {
    const photoFiles = formData.getAll("photos") as File[];
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      if (file && file.size > 0) {
        photoUrls.push(await uploadToCloudinary(file, "tourvibe/reviews"));
      }
    }

    await prisma.review.create({
      data: {
        id: crypto.randomUUID(),
        tourPackageId,
        userId,
        rating,
        comment,
        photos: photoUrls.length ? photoUrls.join(",") : null,
        reviewerName,
        reviewerImage,
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}

export async function updateReview(id: string, formData: FormData) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  const tourPackageId = formData.get("tourPackageId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  if (isNaN(rating)) return { error: "Rating is required" };

  try {
    if (!isSuperAdmin) {
      const review = await prisma.review.findUnique({ where: { id }, select: { userId: true } });
      if (!review || review.userId !== userId) throw new Error("Unauthorized");
    }

    const data: Record<string, unknown> = { rating, comment };
    if (tourPackageId) data.tourPackageId = tourPackageId;

    const existingPhotos = ((formData.get("existingPhotos") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const photoFiles = formData.getAll("photos") as File[];
    const newPhotoUrls: string[] = [];
    for (const file of photoFiles) {
      if (file && file.size > 0) {
        newPhotoUrls.push(await uploadToCloudinary(file, "tourvibe/reviews"));
      }
    }
    const finalPhotos = [...existingPhotos, ...newPhotoUrls];
    data.photos = finalPhotos.length ? finalPhotos.join(",") : null;

    if (isSuperAdmin) {
      const customName = formData.get("reviewerName") as string;
      const customImageFile = formData.get("reviewerImage") as File | null;
      if (customName) data.reviewerName = customName;
      if (customImageFile && customImageFile.size > 0) {
        data.reviewerImage = await uploadToCloudinary(customImageFile, "tourvibe/reviews");
      }
    }

    await prisma.review.update({ where: { id }, data });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}

export async function deleteReview(id: string) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  try {
    if (!isSuperAdmin) {
      const review = await prisma.review.findUnique({ where: { id }, select: { userId: true } });
      if (!review || review.userId !== userId) throw new Error("Unauthorized");
    }
    await prisma.review.delete({ where: { id } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}

export async function deleteReviews(ids: string[]) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  if (ids.length === 0) return { error: "No IDs provided" };

  try {
    if (!isSuperAdmin) {
      const reviews = await prisma.review.findMany({
        where: { id: { in: ids } },
        select: { userId: true },
      });
      if (reviews.some((r) => r.userId !== userId)) {
        throw new Error("Unauthorized: You can only delete your own reviews");
      }
    }
    await prisma.review.deleteMany({ where: { id: { in: ids } } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}
