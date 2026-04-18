import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireDashboardSession } from "@/lib/dashboard";
import { Vehicle, VehicleTable } from "./vehicle-table";

export default async function VehiclesPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const vehicles = db.prepare(`
    SELECT v.*, u.name as driverName, u.email as driverEmail
    FROM vehicle v
    LEFT JOIN user u ON v.driverId = u.id
    ORDER BY v.createdAt DESC
  `).all() as Vehicle[];

  const drivers = db.prepare(`
    SELECT id, name, email FROM user WHERE role = 'driver'
  `).all() as { id: string; name: string; email: string }[];

  return (
    <>
      <SiteHeader title="Vehicle Management" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Fleet Directory</h2>
            <p className="text-muted-foreground">
              Overview of all registered vehicles in the system.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Register New Vehicle
            </Link>
          </Button>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-0">
            <div className="p-6">
               <VehicleTable vehicles={vehicles} drivers={drivers} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
