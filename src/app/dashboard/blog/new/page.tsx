import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requireDashboardSession } from "@/lib/dashboard";
import { CreateBlogPostForm } from "../blog-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewBlogPostPage() {
  const { isSuperAdmin, allowedMenus } = await requireDashboardSession();

  if (!isSuperAdmin && !allowedMenus?.includes("Blog")) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">You do not have access to create blog posts.</p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/blog">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">New Blog Post</h2>
      </div>

      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <CreateBlogPostForm />
        </CardContent>
      </Card>
    </div>
  );
}
