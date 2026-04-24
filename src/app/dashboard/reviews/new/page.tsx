import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { CreateReviewForm } from "../review-forms";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewReviewPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  // Fetch all tour packages for the creation form
  const tourPackages = await db.tourPackage.findMany({
    select: { id: true, name: true }
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/reviews">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          Add New Review
        </h2>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <CreateReviewForm 
            tourPackages={tourPackages} 
            isSuperAdmin={isSuperAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
