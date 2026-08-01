"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession, canPerform } from "@/lib/dashboard";
import { generateOrderId } from "@/lib/utils";

const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

export async function createGalleryItem(formData: FormData) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "gallery", "create", "Gallery")) throw new Error("Unauthorized");

  const title = (formData.get("title") as string) || "";
  const caption = (formData.get("caption") as string) || "";
  const category = (formData.get("category") as string) || "General";
  const location = (formData.get("location") as string) || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";
  const type = (formData.get("type") as string) || "IMAGE";
  const directUrl = (formData.get("url") as string) || "";

  const mediaFile = formData.get("mediaFile") as File | null;
  const thumbnailFile = formData.get("thumbnailFile") as File | null;

  let url = directUrl;
  let thumbnailUrl: string | null = null;

  if (mediaFile && mediaFile.size > 0) {
    if (type === "VIDEO" && mediaFile.size > MAX_VIDEO_BYTES) {
      return { error: "Video file must be 50MB or smaller." };
    }
    if (type === "IMAGE" && mediaFile.size > MAX_IMAGE_BYTES) {
      return { error: "Image file must be 50MB or smaller." };
    }

    const folder = type === "VIDEO" ? "tourvibe/gallery/videos" : "tourvibe/gallery/images";
    const mediaType = type === "VIDEO" ? "video" : "image";
    url = await uploadToCloudinary(mediaFile, folder, mediaType);
  }

  if (!url) {
    return { error: "Please upload a media file or provide a valid media URL." };
  }

  if (thumbnailFile && thumbnailFile.size > 0) {
    thumbnailUrl = await uploadToCloudinary(thumbnailFile, "tourvibe/gallery/thumbnails", "image");
  }

  const id = generateOrderId();

  try {
    await prisma.galleryItem.create({
      data: {
        id,
        title,
        caption,
        type,
        url,
        thumbnailUrl,
        category,
        location,
        featured,
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create gallery item" };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  return { success: true };
}

export async function updateGalleryItem(id: string, formData: FormData) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "gallery", "update", "Gallery")) throw new Error("Unauthorized");

  const title = (formData.get("title") as string) || "";
  const caption = (formData.get("caption") as string) || "";
  const category = (formData.get("category") as string) || "General";
  const location = (formData.get("location") as string) || null;
  const featured = formData.get("featured") === "true" || formData.get("featured") === "on";

  try {
    await prisma.galleryItem.update({
      where: { id },
      data: {
        title,
        caption,
        category,
        location,
        featured,
      },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update gallery item" };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  return { success: true };
}

export async function toggleFeaturedGalleryItem(id: string, featured: boolean) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "gallery", "update", "Gallery")) throw new Error("Unauthorized");

  try {
    await prisma.galleryItem.update({
      where: { id },
      data: { featured },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to toggle featured state" };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const sess = await requireDashboardSession();
  if (!canPerform(sess, "gallery", "delete", "Gallery")) throw new Error("Unauthorized");

  try {
    await prisma.galleryItem.delete({
      where: { id },
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete gallery item" };
  }

  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  return { success: true };
}
