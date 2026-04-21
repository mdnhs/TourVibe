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

  const initialDrivers = db
    .prepare(
      `SELECT u.id, u.name, u.image, u.lat, u.lng, u.locationName, u.locationUpdatedAt,
              v.make as vehicleMake, v.model as vehicleModel, v.licensePlate as vehicleLicense
       FROM user u
       LEFT JOIN vehicle v ON v.driverId = u.id
       WHERE u.role = 'driver' AND u.lat IS NOT NULL AND u.lng IS NOT NULL
       ORDER BY u.locationUpdatedAt DESC`,
    )
    .all() as DriverLocation[];

  let driverRow: DriverRow | null = null;
  if (isDriver) {
    driverRow = db
      .prepare("SELECT id, lat, lng, locationName, locationUpdatedAt FROM user WHERE id = ?")
      .get(session.user.id) as DriverRow | null;
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
              <TrackingClient initialDrivers={initialDrivers} hideDirections={true} />
            </div>
          </>
        )}

        {/* Admin / Tourist: directions panel + map side by side */}
        {!isDriver && (
          <TrackingClient initialDrivers={initialDrivers} />
        )}
      </div>
    </>
  );
}
