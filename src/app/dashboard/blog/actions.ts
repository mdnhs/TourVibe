"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const uniqueName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
  await fs.writeFile(path.join(uploadDir, uniqueName), buffer);
  return `/uploads/${uniqueName}`;
}

async function checkAuth() {
  const session = await requireDashboardSession();
  if (!session.isSuperAdmin && !session.allowedMenus?.includes("Blog")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createBlogPost(formData: FormData) {
  try {
    const { session } = await checkAuth();

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "Title is required" };

    const rawSlug = (formData.get("slug") as string)?.trim();
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);
    const excerpt = (formData.get("excerpt") as string)?.trim() || null;
    const content = (formData.get("content") as string) || "";
    const tags = (formData.get("tags") as string)?.trim() || "";
    const metaTitle = (formData.get("metaTitle") as string)?.trim() || "";
    const metaDescription = (formData.get("metaDescription") as string)?.trim() || "";
    const status = (formData.get("status") as string) === "published" ? "published" : "draft";

    // Handle cover image — file upload takes priority
    const coverImageFile = formData.get("coverImageFile") as File | null;
    let coverImage = (formData.get("coverImage") as string)?.trim() || "";
    if (coverImageFile && coverImageFile.size > 0) {
      coverImage = await saveFile(coverImageFile);
    }

    const id = crypto.randomUUID();
    const publishedAt = status === "published" ? new Date().toISOString() : null;

    db.prepare(`
      INSERT INTO blog_post (id, title, slug, excerpt, content, coverImage, authorId, authorName, status, tags, metaTitle, metaDescription, publishedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, slug, excerpt, content, coverImage, session.user.id, session.user.name ?? "", status, tags, metaTitle, metaDescription, publishedAt);

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true, id };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateBlogPost(id: string, formData: FormData) {
  try {
    await checkAuth();

    const title = (formData.get("title") as string)?.trim();
    if (!title) return { error: "Title is required" };

    const rawSlug = (formData.get("slug") as string)?.trim();
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);
    const excerpt = (formData.get("excerpt") as string)?.trim() || null;
    const content = (formData.get("content") as string) || "";
    const tags = (formData.get("tags") as string)?.trim() || "";
    const metaTitle = (formData.get("metaTitle") as string)?.trim() || "";
    const metaDescription = (formData.get("metaDescription") as string)?.trim() || "";
    const status = (formData.get("status") as string) === "published" ? "published" : "draft";

    // Handle cover image — new upload takes priority, then existing value, then DB value
    const coverImageFile = formData.get("coverImageFile") as File | null;
    const existing = db.prepare("SELECT coverImage, status, publishedAt FROM blog_post WHERE id = ?")
      .get(id) as { coverImage: string; status: string; publishedAt: string | null } | undefined;
    if (!existing) return { error: "Post not found" };

    let coverImage = (formData.get("coverImage") as string)?.trim() || existing.coverImage || "";
    if (coverImageFile && coverImageFile.size > 0) {
      coverImage = await saveFile(coverImageFile);
    }

    let publishedAt = existing.publishedAt;
    if (status === "published" && !publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (status === "draft") {
      publishedAt = null;
    }

    db.prepare(`
      UPDATE blog_post
      SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, status = ?, tags = ?, metaTitle = ?, metaDescription = ?, publishedAt = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, slug, excerpt, content, coverImage, status, tags, metaTitle, metaDescription, publishedAt, id);

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await checkAuth();
    db.prepare("DELETE FROM blog_post WHERE id = ?").run(id);
    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteBlogPosts(ids: string[]) {
  if (ids.length === 0) return { error: "No IDs provided" };
  try {
    await checkAuth();
    const placeholders = ids.map(() => "?").join(",");
    db.prepare(`DELETE FROM blog_post WHERE id IN (${placeholders})`).run(...ids);
    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function toggleBlogPostStatus(id: string) {
  try {
    await checkAuth();
    const post = db.prepare("SELECT status, publishedAt FROM blog_post WHERE id = ?")
      .get(id) as { status: string; publishedAt: string | null } | undefined;
    if (!post) return { error: "Post not found" };

    const newStatus = post.status === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? (post.publishedAt ?? new Date().toISOString()) : null;

    db.prepare(`UPDATE blog_post SET status = ?, publishedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(newStatus, publishedAt, id);

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true, newStatus };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
