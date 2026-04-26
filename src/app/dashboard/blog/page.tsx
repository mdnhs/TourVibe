import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Eye, EyeOff } from "lucide-react";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { BlogTable } from "./blog-table";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Blog Management | TourVibe",
  description: "Manage blog posts",
};

export default async function BlogPage() {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();

  if (!isSuperAdmin && !allowedMenus?.includes("Blog")) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">You do not have access to Blog management.</p>
      </div>
    );
  }

  const postsRaw = await db.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = postsRaw.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  const draftCount = posts.filter((p) => p.status === "draft").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  return (
    <>
      <SiteHeader title="Blog Management" subtitle="Create and manage blog posts" />
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
            <p className="text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        {/* Status summary strip */}
        {posts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div className="flex items-center gap-2.5 rounded-xl border bg-emerald-50 border-emerald-200 px-4 py-3">
              <Eye className="size-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Published</p>
                <p className="text-xl font-bold text-emerald-700 leading-tight">{publishedCount}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${draftCount > 0 ? "bg-amber-50 border-amber-200" : "bg-muted/30 border-border"}`}>
              <EyeOff className={`size-4 shrink-0 ${draftCount > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              <div>
                <p className={`text-xs font-medium ${draftCount > 0 ? "text-amber-600" : "text-muted-foreground"}`}>Draft</p>
                <p className={`text-xl font-bold leading-tight ${draftCount > 0 ? "text-amber-700" : "text-muted-foreground"}`}>{draftCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Warning banner for unpublished posts */}
        {draftCount > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <EyeOff className="size-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{draftCount} draft post{draftCount !== 1 ? "s" : ""}</span>
              {" "}will not appear on the public blog or landing page.
              Use the <span className="font-semibold">⋯ menu → Toggle Status</span> to publish them.
            </p>
          </div>
        )}

        <BlogTable posts={posts} />
      </div>
    </>
  );
}
