"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {}

  const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${uniqueName}`;
}

export async function createReview(formData: FormData) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  const tourPackageId = formData.get("tourPackageId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;
  
  let reviewerName = session.user.name;
  let reviewerImage = session.user.image;

  if (isSuperAdmin) {
    const customName = formData.get("reviewerName") as string;
    const customImageFile = formData.get("reviewerImage") as File | null;

    if (customName) reviewerName = customName;
    if (customImageFile && customImageFile.size > 0) {
      reviewerImage = await saveFile(customImageFile);
    }
  }

  if (!tourPackageId || isNaN(rating)) {
    return { error: "Missing required fields" };
  }

  const id = crypto.randomUUID();

  try {
    db.prepare(`
      INSERT INTO review (id, tourPackageId, userId, rating, comment, reviewerName, reviewerImage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, tourPackageId, userId, rating, comment, reviewerName, reviewerImage);
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

  if (isNaN(rating)) {
    return { error: "Rating is required" };
  }

  try {
    // Check ownership if not admin
    if (!isSuperAdmin) {
      const review = db.prepare("SELECT userId FROM review WHERE id = ?").get(id) as { userId: string } | undefined;
      if (!review || review.userId !== userId) {
        throw new Error("Unauthorized");
      }
    }

    let query = "UPDATE review SET rating = ?, comment = ?, updatedAt = CURRENT_TIMESTAMP";
    const params: any[] = [rating, comment];

    if (tourPackageId) {
      query += ", tourPackageId = ?";
      params.push(tourPackageId);
    }

    if (isSuperAdmin) {
      const customName = formData.get("reviewerName") as string;
      const customImageFile = formData.get("reviewerImage") as File | null;

      if (customName) {
        query += ", reviewerName = ?";
        params.push(customName);
      }
      if (customImageFile && customImageFile.size > 0) {
        const imageUrl = await saveFile(customImageFile);
        query += ", reviewerImage = ?";
        params.push(imageUrl);
      }
    }

    query += " WHERE id = ?";
    params.push(id);

    db.prepare(query).run(...params);
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
    // Check ownership if not admin
    if (!isSuperAdmin) {
      const review = db.prepare("SELECT userId FROM review WHERE id = ?").get(id) as { userId: string } | undefined;
      if (!review || review.userId !== userId) {
        throw new Error("Unauthorized");
      }
    }

    db.prepare("DELETE FROM review WHERE id = ?").run(id);
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
      // For tourists, we need to make sure they own ALL the reviews they are trying to delete
      const placeholders = ids.map(() => "?").join(",");
      const reviews = db.prepare(`SELECT userId FROM review WHERE id IN (${placeholders})`).all(...ids) as { userId: string }[];
      if (reviews.some(r => r.userId !== userId)) {
        throw new Error("Unauthorized: You can only delete your own reviews");
      }
    }

    const placeholders = ids.map(() => "?").join(",");
    db.prepare(`DELETE FROM review WHERE id IN (${placeholders})`).run(...ids);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/reviews");
  return { success: true };
}
