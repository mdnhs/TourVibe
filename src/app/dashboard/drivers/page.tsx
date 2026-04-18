import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { DriverTable, Driver } from "./driver-table";
import { CreateDriverForm } from "./driver-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function DriversPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const drivers = db.prepare(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.createdAt,
      v.id as vehicleId,
      v.make || ' ' || v.model as vehicleName,
      v.licensePlate as vehiclePlate
    FROM user u
    LEFT JOIN vehicle v ON u.id = v.driverId
    WHERE u.role = 'driver'
    ORDER BY u.createdAt DESC
  `).all() as Driver[];

  return (
    <>
      <SiteHeader title="Driver Management" subtitle="Admin only route" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Driver Directory</h2>
            <p className="text-muted-foreground">
              Manage driver accounts and their assignments.
            </p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button data-slot="dialog-trigger">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Driver
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Create a new driver account. They can then be assigned to vehicles.
                </DialogDescription>
              </DialogHeader>
              <CreateDriverForm />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-0">
            <div className="p-6">
               <DriverTable drivers={drivers} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
