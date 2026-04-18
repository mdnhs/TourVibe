import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { EditReviewForm } from "../../review-forms";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, isSuperAdmin } = await requireDashboardSession();
  const userId = session.user.id;

  // Fetch review with tour package name
  const review = db.prepare(`
    SELECT 
      r.*, 
      tp.name as tourPackageName
    FROM review r
    JOIN tour_package tp ON r.tourPackageId = tp.id
    WHERE r.id = ?
  `).get(id) as any;

  if (!review) {
    notFound();
  }

  // Fetch all tour packages for the edit form
  const tourPackages = db.prepare("SELECT id, name FROM tour_package").all() as { id: string, name: string }[];

  // Check ownership if not admin
  if (!isSuperAdmin && review.userId !== userId) {
    redirect("/dashboard/reviews");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/reviews">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          Edit Review
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Update Review</CardTitle>
          </CardHeader>
          <CardContent>
            <EditReviewForm 
              review={review} 
              tourPackages={tourPackages}
              isSuperAdmin={isSuperAdmin} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase">Date Created</p>
              <p className="text-sm font-semibold">{new Date(review.createdAt).toLocaleString()}</p>
            </div>
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Last Updated</p>
                <p className="text-sm font-semibold">{new Date(review.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
