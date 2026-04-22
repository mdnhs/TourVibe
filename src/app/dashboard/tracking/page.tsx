import { SiteHeader } from "@/components/site-header";
import { requireDashboardSession } from "@/lib/dashboard";
import { db } from "@/lib/db";
import { LocationPanel } from "./location-panel";
import { TrackingClient } from "./tracking-client";
import type { DriverLocation } from "@/app/api/drivers/locations/route";

interface DriverRow {
  id: string;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  locationUpdatedAt: string | null;
}

export default async function TrackingPage() {
  const { session, role, isSuperAdmin } = await requireDashboardSession();
  const isDriver = role === "driver";

  const users = await db.user.findMany({
    where: {
      role: "driver",
      lat: { not: null },
      lng: { not: null },
    },
    select: {
      id: true,
      name: true,
      image: true,
      lat: true,
      lng: true,
      locationName: true,
      locationUpdatedAt: true,
      vehicles: {
        take: 1,
        select: { make: true, model: true, licensePlate: true },
      },
    },
    orderBy: { locationUpdatedAt: "desc" },
  });

  const initialDrivers: DriverLocation[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    lat: u.lat!,
    lng: u.lng!,
    locationName: u.locationName,
    locationUpdatedAt: u.locationUpdatedAt?.toISOString() ?? null,
    vehicleMake: u.vehicles[0]?.make ?? null,
    vehicleModel: u.vehicles[0]?.model ?? null,
    vehicleLicense: u.vehicles[0]?.licensePlate ?? null,
  }));

  let driverRow: DriverRow | null = null;
  if (isDriver) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        lat: true,
        lng: true,
        locationName: true,
        locationUpdatedAt: true,
      },
    });

    if (u) {
      driverRow = {
        id: u.id,
        lat: u.lat,
        lng: u.lng,
        locationName: u.locationName,
        locationUpdatedAt: u.locationUpdatedAt?.toISOString() ?? null,
      };
    }
  }

  const subtitle = isSuperAdmin
    ? `${initialDrivers.length} driver${initialDrivers.length !== 1 ? "s" : ""} currently live`
    : isDriver
      ? "Share your GPS location with tourists and admin"
      : "Track your driver · get directions";

  return (
    <>
      <SiteHeader title="Live Tracking" subtitle={subtitle} />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        {/* Driver: location sharing panel + plain map */}
        {isDriver && driverRow && (
          <>
            <LocationPanel
              currentLat={driverRow.lat}
              currentLng={driverRow.lng}
              currentLocationName={driverRow.locationName}
              locationUpdatedAt={driverRow.locationUpdatedAt}
            />
            <div className="h-[calc(100vh-22rem)] min-h-[360px]">
              <TrackingClient
                initialDrivers={initialDrivers}
                hideDirections={true}
              />
            </div>
          </>
        )}

        {/* Admin / Tourist: directions panel + map side by side */}
        {!isDriver && <TrackingClient initialDrivers={initialDrivers} />}
      </div>
    </>
  );
}
