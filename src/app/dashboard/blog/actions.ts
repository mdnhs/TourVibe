"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireDashboardSession } from "@/lib/dashboard";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
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

    const coverImageFile = formData.get("coverImageFile") as File | null;
    let coverImage = (formData.get("coverImage") as string)?.trim() || "";
    if (coverImageFile && coverImageFile.size > 0) {
      coverImage = await uploadToCloudinary(coverImageFile, "tourvibe/blog");
    }

    const id = crypto.randomUUID();
    const publishedAt = status === "published" ? new Date() : null;

    await prisma.blogPost.create({
      data: {
        id,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        authorId: session.user.id,
        authorName: session.user.name ?? "",
        status,
        tags,
        metaTitle,
        metaDescription,
        publishedAt,
      },
    });

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

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { coverImage: true, status: true, publishedAt: true },
    });
    if (!existing) return { error: "Post not found" };

    const coverImageFile = formData.get("coverImageFile") as File | null;
    let coverImage = (formData.get("coverImage") as string)?.trim() || existing.coverImage || "";
    if (coverImageFile && coverImageFile.size > 0) {
      coverImage = await uploadToCloudinary(coverImageFile, "tourvibe/blog");
    }

    let publishedAt = existing.publishedAt;
    if (status === "published" && !publishedAt) {
      publishedAt = new Date();
    } else if (status === "draft") {
      publishedAt = null;
    }

    await prisma.blogPost.update({
      where: { id },
      data: { title, slug, excerpt, content, coverImage, status, tags, metaTitle, metaDescription, publishedAt },
    });

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
    await prisma.blogPost.delete({ where: { id } });
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
    await prisma.blogPost.deleteMany({ where: { id: { in: ids } } });
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
    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });
    if (!post) return { error: "Post not found" };

    const newStatus = post.status === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? (post.publishedAt ?? new Date()) : null;

    await prisma.blogPost.update({ where: { id }, data: { status: newStatus, publishedAt } });

    revalidatePath("/dashboard/blog");
    revalidatePath("/blog");
    revalidatePath("/");
    return { success: true, newStatus };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") return { error: "Unauthorized" };
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
