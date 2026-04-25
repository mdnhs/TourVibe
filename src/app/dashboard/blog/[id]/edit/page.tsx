import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { EditBlogPostForm } from "../../blog-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();

  if (!isSuperAdmin && !allowedMenus?.includes("Blog")) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">You do not have access to edit blog posts.</p>
      </div>
    );
  }

  const { id } = await params;
  const post = await db.blogPost.findUnique({
    where: { id },
  });

  if (!post) notFound();

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/blog">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
          <p className="text-muted-foreground text-sm truncate max-w-md">{post.title}</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <EditBlogPostForm post={post} />
        </CardContent>
      </Card>
    </div>
  );
}
