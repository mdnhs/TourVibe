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
    const thumbnailUrl = await saveFile(thumbnailFile);
    
    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        const url = await saveFile(file);
        galleryUrls.push(url);
      }
    }

    // Insert tour package
    db.prepare(`
      INSERT INTO tour_package (id, name, description, price, duration, maxPersons, thumbnail, gallery)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, price, duration, maxPersons, thumbnailUrl, galleryUrls.join(","));

    // Insert vehicle assignments
    const insertVehicle = db.prepare(`
      INSERT INTO tour_package_vehicle (tourPackageId, vehicleId)
      VALUES (?, ?)
    `);
    
    for (const vehicleId of vehicleIds) {
      insertVehicle.run(id, vehicleId);
    }

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
      thumbnailUrl = await saveFile(thumbnailFile);
    }

    const newGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        const url = await saveFile(file);
        newGalleryUrls.push(url);
      }
    }
    
    const finalGallery = [
      ...existingGallery.split(",").filter(Boolean),
      ...newGalleryUrls
    ].join(",");

    // Update tour package
    db.prepare(`
      UPDATE tour_package
      SET name = ?, description = ?, price = ?, duration = ?, maxPersons = ?, thumbnail = ?, gallery = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, price, duration, maxPersons, thumbnailUrl, finalGallery, id);

    // Update vehicle assignments
    db.prepare("DELETE FROM tour_package_vehicle WHERE tourPackageId = ?").run(id);
    const insertVehicle = db.prepare(`
      INSERT INTO tour_package_vehicle (tourPackageId, vehicleId)
      VALUES (?, ?)
    `);
    
    for (const vehicleId of vehicleIds) {
      insertVehicle.run(id, vehicleId);
    }

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
    db.prepare("DELETE FROM tour_package WHERE id = ?").run(id);
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
    const placeholders = ids.map(() => "?").join(",");
    db.prepare(`DELETE FROM tour_package WHERE id IN (${placeholders})`).run(...ids);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/tours");
  return { success: true };
}
