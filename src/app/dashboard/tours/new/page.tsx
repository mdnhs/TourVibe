import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { CreateTourForm } from "../tour-forms";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewTourPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  // Fetch all vehicles for the assignment form
  const vehicles = await db.vehicle.findMany({
    select: {
      id: true,
      make: true,
      model: true,
      licensePlate: true,
    },
  });

  return (
    <>
      <SiteHeader
        title="Create Tour Package"
        subtitle="Define a new tour destination and itinerary"
      />
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/tours">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            New Tour Package
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <CreateTourForm vehicles={vehicles} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
