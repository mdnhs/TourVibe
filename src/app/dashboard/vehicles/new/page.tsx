import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { CreateVehicleForm } from "../vehicle-forms";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewVehiclePage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const drivers = await db.user.findMany({
    where: { role: "driver" },
    select: { id: true, name: true, email: true },
  });

  return (
    <>
      <SiteHeader
        title="Add New Vehicle"
        subtitle="Register a new vehicle to the fleet"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/vehicles">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Vehicle Registration
          </h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <CreateVehicleForm drivers={drivers} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
