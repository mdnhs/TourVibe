import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { TourTable, TourPackage } from "./tour-table";

export default async function ToursPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  // Fetch tour packages with assigned vehicle counts and IDs
  const tours = db.prepare(`
    SELECT 
      tp.id, tp.name, tp.description, tp.price, tp.duration, tp.maxPersons, tp.thumbnail, tp.gallery, tp.createdAt, tp.updatedAt,
      COUNT(tpv.vehicleId) as vehicleCount,
      GROUP_CONCAT(tpv.vehicleId) as assignedVehicles
    FROM tour_package tp
    LEFT JOIN tour_package_vehicle tpv ON tp.id = tpv.tourPackageId
    GROUP BY tp.id
    ORDER BY tp.createdAt DESC
  `).all() as TourPackage[];

  // Fetch all vehicles for the assignment form
  const vehicles = db.prepare(`
    SELECT id, make, model, licensePlate FROM vehicle
  `).all() as { id: string; make: string; model: string; licensePlate: string }[];

  return (
    <>
      <SiteHeader title="Tour Management" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Tour Packages</h2>
            <p className="text-muted-foreground">
              Manage your tour destinations, pricing, and vehicle assignments.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/tours/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Tour Package
            </Link>
          </Button>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-0">
            <div className="p-6">
               <TourTable tours={tours} vehicles={vehicles} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
