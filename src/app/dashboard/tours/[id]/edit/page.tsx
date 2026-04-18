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
  const tour = db.prepare(`
    SELECT 
      tp.id, tp.name, tp.description, tp.price, tp.duration, tp.maxPersons, tp.thumbnail, tp.gallery, tp.createdAt, tp.updatedAt,
      GROUP_CONCAT(tpv.vehicleId) as assignedVehicles
    FROM tour_package tp
    LEFT JOIN tour_package_vehicle tpv ON tp.id = tpv.tourPackageId
    WHERE tp.id = ?
    GROUP BY tp.id
  `).get(id) as TourPackage | undefined;

  if (!tour) {
    notFound();
  }

  // Fetch all vehicles for the assignment form
  const vehicles = db.prepare(`
    SELECT id, make, model, licensePlate FROM vehicle
  `).all() as { id: string; make: string; model: string; licensePlate: string }[];

  return (
    <>
      <SiteHeader
        title="Edit Tour Package"
        subtitle={`Updating ${tour.name}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
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
