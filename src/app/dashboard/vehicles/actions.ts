"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";

export async function createVehicle(formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string);
  const licensePlate = formData.get("licensePlate") as string;
  const driverIdStr = formData.get("driverId") as string | null;
  const driverId = driverIdStr === "none" ? null : driverIdStr;

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];

  if (!make || !model || !year || !licensePlate || !thumbnailFile || thumbnailFile.size === 0) {
    return { error: "Missing required fields (including thumbnail)" };
  }

  const id = crypto.randomUUID();

  try {
    const thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/vehicles");

    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        galleryUrls.push(await uploadToCloudinary(file, "tourvibe/vehicles"));
      }
    }

    await prisma.vehicle.create({
      data: {
        id,
        make,
        model,
        year,
        licensePlate,
        driverId: driverId || null,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls.join(","),
      },
    });
  } catch (err: any) {
    console.error("Error in createVehicle:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "License plate already exists" };
    }
    return { error: err?.message || "Unknown error occurred" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function updateVehicle(id: string, formData: FormData) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  const make = formData.get("make") as string;
  const model = formData.get("model") as string;
  const year = parseInt(formData.get("year") as string);
  const licensePlate = formData.get("licensePlate") as string;
  const driverIdStr = formData.get("driverId") as string | null;
  const driverId = driverIdStr === "none" ? null : driverIdStr;

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];

  const existingThumbnail = formData.get("existingThumbnail") as string;
  const existingGallery = formData.get("existingGallery") as string;

  if (!make || !model || !year || !licensePlate) {
    return { error: "Missing required fields" };
  }

  try {
    let thumbnailUrl = existingThumbnail;
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/vehicles");
    }

    const newGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        newGalleryUrls.push(await uploadToCloudinary(file, "tourvibe/vehicles"));
      }
    }

    const finalGallery = [
      ...existingGallery.split(",").filter(Boolean),
      ...newGalleryUrls,
    ].join(",");

    await prisma.vehicle.update({
      where: { id },
      data: { make, model, year, licensePlate, driverId: driverId || null, thumbnail: thumbnailUrl, gallery: finalGallery },
    });
  } catch (err: any) {
    console.error("Error in updateVehicle:", err);
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "License plate already exists" };
    }
    return { error: err?.message || "Unknown error occurred" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function deleteVehicle(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    await prisma.vehicle.delete({ where: { id } });
  } catch (err: any) {
    console.error("Error in deleteVehicle:", err);
    return { error: err?.message || "Unknown error occurred" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function deleteVehicles(ids: string[]) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  if (ids.length === 0) return { error: "No IDs provided" };

  try {
    await prisma.vehicle.deleteMany({ where: { id: { in: ids } } });
  } catch (err: any) {
    console.error("Error in deleteVehicles:", err);
    return { error: err?.message || "Unknown error occurred" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}
