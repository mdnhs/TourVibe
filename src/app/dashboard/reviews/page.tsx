import { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { ReviewTable } from "./review-table";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Review Management | TourVibe",
  description: "Manage tour package reviews",
};

export default async function ReviewPage() {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const currentUserId = session.user.id;

  // Fetch reviews with tour package and user info
  const reviews = await db.review.findMany({
    include: {
      tourPackage: {
        select: { name: true }
      },
      user: {
        select: { name: true, email: true, image: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Flatten for the table component which expects tourPackageName etc.
  const flattenedReviews = reviews.map(r => ({
    ...r,
    tourPackageName: r.tourPackage.name,
    userName: r.user.name,
    userEmail: r.user.email,
    userImage: r.user.image
  }));

  return (
    <>
      <SiteHeader title="Review Management" subtitle="Manage and view tour package reviews" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
            <p className="text-muted-foreground">
              Overview of all tour package reviews.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/reviews/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Link>
          </Button>
        </div>

        <ReviewTable 
          reviews={flattenedReviews} 
          currentUserId={currentUserId} 
          isSuperAdmin={isSuperAdmin} 
        />
      </div>
    </>
  );
}
