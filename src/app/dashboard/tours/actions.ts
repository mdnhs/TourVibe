"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";
import { generateOrderId, slugify } from "@/lib/utils";

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB per gallery image
const MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10MB per promo video

export async function createTour(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
  const durationHours = parseInt(formData.get("durationHours") as string);
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];
  const highlightsRaw = formData.getAll("highlights") as string[];
  const highlights = highlightsRaw.filter(Boolean).join("\n") || null;

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];
  const promoVideoFile = formData.get("promoVideo") as File | null;

  if (!name || isNaN(hourlyRate) || isNaN(durationHours) || durationHours < 1 || isNaN(maxPersons) || !thumbnailFile || thumbnailFile.size === 0) {
    return { error: "Missing required fields (Name, Hourly Rate, Duration Hours, Persons, Thumbnail)" };
  }

  const price = Math.round(hourlyRate * durationHours * 100) / 100;
  const duration = `${durationHours} ${durationHours === 1 ? "Hour" : "Hours"}`;
  const id = generateOrderId();
  const slug = slugify(name);

  try {
    const thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/tours", "image");

    if (galleryFiles.some((f) => f.size > MAX_IMAGE_BYTES)) {
      return { error: "Each gallery image must be 1MB or smaller." };
    }
    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        galleryUrls.push(await uploadToCloudinary(file, "tourvibe/tours", "image"));
      }
    }

    if (promoVideoFile && promoVideoFile.size > MAX_VIDEO_BYTES) {
      return { error: "Promotional video must be 10MB or smaller." };
    }
    let promoVideoUrl: string | null = null;
    if (promoVideoFile && promoVideoFile.size > 0) {
      promoVideoUrl = await uploadToCloudinary(promoVideoFile, "tourvibe/tours/videos", "video");
    }

    await prisma.tourPackage.create({
      data: {
        id,
        name,
        slug,
        description,
        price,
        hourlyRate,
        durationHours,
        duration,
        maxPersons,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls.join(","),
        promoVideoUrl,
        highlights,
        vehicles: {
          create: vehicleIds.map((vehicleId) => ({ vehicleId })),
        },
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}

export async function updateTour(id: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = slugify(name);
  const description = formData.get("description") as string;
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);
  const durationHours = parseInt(formData.get("durationHours") as string);
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];
  const highlightsRaw = formData.getAll("highlights") as string[];
  const highlights = highlightsRaw.filter(Boolean).join("\n") || null;

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];
  const promoVideoFile = formData.get("promoVideo") as File | null;

  const existingThumbnail = formData.get("existingThumbnail") as string;
  const existingGallery = formData.get("existingGallery") as string;
  const existingPromoVideoUrl = formData.get("existingPromoVideoUrl") as string;

  if (!name || isNaN(hourlyRate) || isNaN(durationHours) || durationHours < 1 || isNaN(maxPersons)) {
    return { error: "Missing required fields" };
  }

  const price = Math.round(hourlyRate * durationHours * 100) / 100;
  const duration = `${durationHours} ${durationHours === 1 ? "Hour" : "Hours"}`;

  try {
    let thumbnailUrl = existingThumbnail;
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/tours", "image");
    }

    if (galleryFiles.some((f) => f.size > MAX_IMAGE_BYTES)) {
      return { error: "Each gallery image must be 1MB or smaller." };
    }
    const newGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        newGalleryUrls.push(await uploadToCloudinary(file, "tourvibe/tours", "image"));
      }
    }

    const finalGallery = [
      ...existingGallery.split(",").filter(Boolean),
      ...newGalleryUrls,
    ].join(",");

    if (promoVideoFile && promoVideoFile.size > MAX_VIDEO_BYTES) {
      return { error: "Promotional video must be 10MB or smaller." };
    }
    let promoVideoUrl: string | null = existingPromoVideoUrl || null;
    if (promoVideoFile && promoVideoFile.size > 0) {
      promoVideoUrl = await uploadToCloudinary(promoVideoFile, "tourvibe/tours/videos", "video");
    }

    await prisma.$transaction([
      prisma.tourPackage.update({
        where: { id },
        data: { name, slug, description, price, hourlyRate, durationHours, duration, maxPersons, thumbnail: thumbnailUrl, gallery: finalGallery, promoVideoUrl, highlights },
      }),
      prisma.tourPackageVehicle.deleteMany({ where: { tourPackageId: id } }),
      prisma.tourPackageVehicle.createMany({
        data: vehicleIds.map((vehicleId) => ({ tourPackageId: id, vehicleId })),
      }),
    ]);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}

export async function deleteTour(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    await prisma.tourPackage.delete({ where: { id } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}

export async function deleteTours(ids: string[]) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  if (ids.length === 0) return { error: "No IDs provided" };

  try {
    await prisma.tourPackage.deleteMany({ where: { id: { in: ids } } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}
