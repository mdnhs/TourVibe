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
  const reviewData = await db.review.findUnique({
    where: { id },
    include: {
      tourPackage: {
        select: { name: true }
      }
    }
  });

  if (!reviewData) {
    notFound();
  }

  // Flatten for the form
  const review = {
    ...reviewData,
    tourPackageName: reviewData.tourPackage.name
  };

  // Fetch all tour packages for the edit form
  const tourPackages = await db.tourPackage.findMany({
    select: { id: true, name: true }
  });

  // Check ownership if not admin
  if (!isSuperAdmin && review.userId !== userId) {
    redirect("/dashboard/reviews");
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
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

      <EditReviewForm review={review} tourPackages={tourPackages} isSuperAdmin={isSuperAdmin} />

      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Review Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-8">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Date Created</p>
                <p className="text-sm font-semibold">{new Date(review.createdAt).toLocaleString()}</p>
              </div>
              {review.updatedAt && review.updatedAt.getTime() !== review.createdAt.getTime() && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Last Updated</p>
                  <p className="text-sm font-semibold">{new Date(review.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            {(() => {
              const photos = (review.photos ?? "").split(",").map((s) => s.trim()).filter(Boolean);
              if (photos.length === 0) return null;
              return (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Photos ({photos.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square w-20 overflow-hidden rounded-lg border bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Review photo" className="size-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
