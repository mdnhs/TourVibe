import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { EditTourForm } from "../../tour-forms";
import { TourPackage } from "../../tour-table";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  // Fetch tour package with assigned vehicle IDs
  const tourData = await db.tourPackage.findUnique({
    where: { id },
    include: {
      vehicles: {
        select: {
          vehicleId: true,
        },
      },
    },
  });

  if (!tourData) {
    notFound();
  }

  const tour = {
    ...tourData,
    assignedVehicles: tourData.vehicles.map((v) => v.vehicleId).join(","),
  } as TourPackage;

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
        title="Edit Tour Package"
        subtitle={`Updating ${tour.name}`}
      />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/tours">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Edit Package Details
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <EditTourForm tour={tour} vehicles={vehicles} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
