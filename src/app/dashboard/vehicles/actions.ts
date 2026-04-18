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
    const thumbnailUrl = await saveFile(thumbnailFile);
    
    const galleryUrls: string[] = [];
    for (const file of galleryFiles) {
      if (file.size > 0) {
        const url = await saveFile(file);
        galleryUrls.push(url);
      }
    }

    db.prepare(`
      INSERT INTO vehicle (id, make, model, year, licensePlate, driverId, thumbnail, gallery)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, make, model, year, licensePlate, driverId || null, thumbnailUrl, galleryUrls.join(","));
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { error: "License plate already exists" };
    }
    return { error: err instanceof Error ? err.message : "Unknown error" };
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

    db.prepare(`
      UPDATE vehicle
      SET make = ?, model = ?, year = ?, licensePlate = ?, driverId = ?, thumbnail = ?, gallery = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(make, model, year, licensePlate, driverId || null, thumbnailUrl, finalGallery, id);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { error: "License plate already exists" };
    }
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function deleteVehicle(id: string) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  try {
    db.prepare("DELETE FROM vehicle WHERE id = ?").run(id);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

export async function deleteVehicles(ids: string[]) {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) throw new Error("Unauthorized");

  if (ids.length === 0) return { error: "No IDs provided" };

  try {
    const placeholders = ids.map(() => "?").join(",");
    db.prepare(`DELETE FROM vehicle WHERE id IN (${placeholders})`).run(...ids);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}
