"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";

export async function createTour(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const duration = formData.get("duration") as string;
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];

  if (!name || isNaN(price) || !duration || isNaN(maxPersons) || !thumbnailFile || thumbnailFile.size === 0) {
    return { error: "Missing required fields (Name, Price, Duration, Persons, Thumbnail)" };
  }

  const id = crypto.randomUUID();

  try {
    const thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/tours");

    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        galleryUrls.push(await uploadToCloudinary(file, "tourvibe/tours"));
      }
    }

    await prisma.tourPackage.create({
      data: {
        id,
        name,
        description,
        price,
        duration,
        maxPersons,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls.join(","),
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
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const duration = formData.get("duration") as string;
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];

  const existingThumbnail = formData.get("existingThumbnail") as string;
  const existingGallery = formData.get("existingGallery") as string;

  if (!name || isNaN(price) || !duration || isNaN(maxPersons)) {
    return { error: "Missing required fields" };
  }

  try {
    let thumbnailUrl = existingThumbnail;
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/tours");
    }

    const newGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        newGalleryUrls.push(await uploadToCloudinary(file, "tourvibe/tours"));
      }
    }

    const finalGallery = [
      ...existingGallery.split(",").filter(Boolean),
      ...newGalleryUrls,
    ].join(",");

    await prisma.$transaction([
      prisma.tourPackage.update({
        where: { id },
        data: { name, description, price, duration, maxPersons, thumbnail: thumbnailUrl, gallery: finalGallery },
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
