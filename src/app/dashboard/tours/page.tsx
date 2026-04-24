import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { TourTable, TourPackage } from "./tour-table";

export default async function ToursPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const [rawTours, vehicles] = await Promise.all([
    prisma.tourPackage.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicles: { select: { vehicleId: true } } },
    }),
    prisma.vehicle.findMany({ select: { id: true, make: true, model: true, licensePlate: true } }),
  ]);

  const tours: TourPackage[] = rawTours.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    vehicleCount: t.vehicles.length,
    assignedVehicles: t.vehicles.map((v) => v.vehicleId).join(","),
  }));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SiteHeader title="Tour Management" subtitle="Admin only route" />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
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
      </div>
    </div>
  );
}
