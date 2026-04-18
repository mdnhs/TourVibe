import { Metadata } from "next";
import { Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { ReviewTable } from "./review-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Review Management | TourVibe",
  description: "Manage tour package reviews",
};

export default async function ReviewPage() {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const currentUserId = session.user.id;

  // Fetch reviews with tour package and user info
  const reviews = db.prepare(`
    SELECT 
      r.*, 
      tp.name as tourPackageName,
      u.name as userName,
      u.email as userEmail,
      u.image as userImage
    FROM review r
    JOIN tour_package tp ON r.tourPackageId = tp.id
    JOIN user u ON r.userId = u.id
    ORDER BY r.createdAt DESC
  `).all() as any[];

  // Fetch all tour packages for the creation form
  const tourPackages = db.prepare("SELECT id, name FROM tour_package").all() as { id: string, name: string }[];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view tour package reviews.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/reviews/new">
            <Plus className="mr-2 size-4" />
            Add Review
          </Link>
        </Button>
      </div>

      <ReviewTable 
        reviews={reviews} 
        currentUserId={currentUserId} 
        isSuperAdmin={isSuperAdmin} 
      />
    </div>
  );
}
