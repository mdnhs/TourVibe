"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession, canPerform } from "@/lib/dashboard";
import { generateOrderId, slugify } from "@/lib/utils";

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB per gallery image
const MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10MB per promo video

export async function createTour(formData: FormData) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "tour", "create", "Tours")) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const rawPrice = parseFloat(formData.get("price") as string);
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string) || 0;
  const durationHours = parseInt(formData.get("durationHours") as string);
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];
  const highlightsRaw = formData.getAll("highlights") as string[];
  const highlights = highlightsRaw.filter(Boolean).join("\n") || null;
  const metaTitle = (formData.get("metaTitle") as string) || "";
  const metaDescription = (formData.get("metaDescription") as string) || "";

  // Base price for Variant 1
  const price = !isNaN(rawPrice) && rawPrice >= 0
    ? rawPrice
    : Math.round((hourlyRate || 0) * (durationHours || 1) * 100) / 100;

  // Variant 2 parsing
  const enableVariant2 = formData.get("enableVariant2") === "true" || formData.get("enableVariant2") === "on";
  let maxPersons2: number | null = null;
  let hourlyRate2: number | null = null;
  let baseHours2: number | null = null;
  let price2: number | null = null;

  if (enableVariant2) {
    const rawMax2 = parseInt(formData.get("maxPersons2") as string);
    const rawRate2 = parseFloat(formData.get("hourlyRate2") as string);
    const rawPrice2 = parseFloat(formData.get("price2") as string);
    const rawBaseHours2 = parseInt(formData.get("baseHours2") as string);

    if (!isNaN(rawMax2) && rawMax2 > 0) {
      maxPersons2 = rawMax2;
    }
    if (!isNaN(rawBaseHours2) && rawBaseHours2 > 0) {
      baseHours2 = rawBaseHours2;
    } else {
      baseHours2 = durationHours;
    }
    if (!isNaN(rawRate2) && rawRate2 >= 0) {
      hourlyRate2 = rawRate2;
    }
    if (!isNaN(rawPrice2) && rawPrice2 >= 0) {
      price2 = rawPrice2;
    } else if (hourlyRate2 !== null) {
      price2 = Math.round((hourlyRate2 * (baseHours2 || durationHours)) * 100) / 100;
    }
  }

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];
  const promoVideoFile = formData.get("promoVideo") as File | null;

  if (!name || isNaN(price) || isNaN(durationHours) || durationHours < 1 || isNaN(maxPersons) || !thumbnailFile || thumbnailFile.size === 0) {
    return { error: "Missing required fields (Name, Base Price, Duration Hours, Persons, Thumbnail)" };
  }

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
        price2,
        maxPersons2,
        hourlyRate2,
        baseHours2,
        thumbnail: thumbnailUrl,
        gallery: galleryUrls.join(","),
        promoVideoUrl,
        highlights,
        metaTitle,
        metaDescription,
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
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "tour", "update", "Tours")) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = slugify(name);
  const description = formData.get("description") as string;
  const rawPrice = parseFloat(formData.get("price") as string);
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string) || 0;
  const durationHours = parseInt(formData.get("durationHours") as string);
  const maxPersons = parseInt(formData.get("maxPersons") as string);
  const vehicleIds = formData.getAll("vehicleIds") as string[];
  const highlightsRaw = formData.getAll("highlights") as string[];
  const highlights = highlightsRaw.filter(Boolean).join("\n") || null;
  const metaTitle = (formData.get("metaTitle") as string) || "";
  const metaDescription = (formData.get("metaDescription") as string) || "";

  // Base price for Variant 1
  const price = !isNaN(rawPrice) && rawPrice >= 0
    ? rawPrice
    : Math.round((hourlyRate || 0) * (durationHours || 1) * 100) / 100;

  // Variant 2 parsing
  const enableVariant2 = formData.get("enableVariant2") === "true" || formData.get("enableVariant2") === "on";
  let maxPersons2: number | null = null;
  let hourlyRate2: number | null = null;
  let baseHours2: number | null = null;
  let price2: number | null = null;

  if (enableVariant2) {
    const rawMax2 = parseInt(formData.get("maxPersons2") as string);
    const rawRate2 = parseFloat(formData.get("hourlyRate2") as string);
    const rawPrice2 = parseFloat(formData.get("price2") as string);
    const rawBaseHours2 = parseInt(formData.get("baseHours2") as string);

    if (!isNaN(rawMax2) && rawMax2 > 0) {
      maxPersons2 = rawMax2;
    }
    if (!isNaN(rawBaseHours2) && rawBaseHours2 > 0) {
      baseHours2 = rawBaseHours2;
    } else {
      baseHours2 = durationHours;
    }
    if (!isNaN(rawRate2) && rawRate2 >= 0) {
      hourlyRate2 = rawRate2;
    }
    if (!isNaN(rawPrice2) && rawPrice2 >= 0) {
      price2 = rawPrice2;
    } else if (hourlyRate2 !== null) {
      price2 = Math.round((hourlyRate2 * (baseHours2 || durationHours)) * 100) / 100;
    }
  }

  const thumbnailFile = formData.get("thumbnail") as File | null;
  const galleryFiles = formData.getAll("gallery") as File[];
  const promoVideoFile = formData.get("promoVideo") as File | null;

  const existingThumbnail = formData.get("existingThumbnail") as string;
  const existingGallery = formData.get("existingGallery") as string;
  const existingPromoVideoUrl = formData.get("existingPromoVideoUrl") as string;

  if (!name || isNaN(price) || isNaN(durationHours) || durationHours < 1 || isNaN(maxPersons)) {
    return { error: "Missing required fields" };
  }

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
        data: {
          name,
          slug,
          description,
          price,
          hourlyRate,
          durationHours,
          duration,
          maxPersons,
          price2,
          maxPersons2,
          hourlyRate2,
          baseHours2,
          thumbnail: thumbnailUrl,
          gallery: finalGallery,
          promoVideoUrl,
          highlights,
          metaTitle,
          metaDescription,
        },
      }),
      prisma.tourPackageVehicle.deleteMany({
        where: { tourPackageId: id },
      }),
      ...(vehicleIds.length > 0
        ? [
            prisma.tourPackageVehicle.createMany({
              data: vehicleIds.map((vehicleId) => ({
                tourPackageId: id,
                vehicleId,
              })),
            }),
          ]
        : []),
    ]);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}

export async function deleteTour(id: string) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "tour", "delete", "Tours")) throw new Error("Unauthorized");

  try {
    await prisma.tourPackage.delete({ where: { id } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}

export async function deleteTours(ids: string[]) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "tour", "delete", "Tours")) throw new Error("Unauthorized");

  try {
    await prisma.tourPackage.deleteMany({ where: { id: { in: ids } } });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}
