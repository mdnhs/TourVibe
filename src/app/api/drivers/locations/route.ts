import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface DriverLocation {
  id: string;
  name: string;
  image: string | null;
  lat: number;
  lng: number;
  locationName: string | null;
  locationUpdatedAt: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleLicense: string | null;
}

export async function GET() {
  const drivers = db
    .prepare(
      `SELECT u.id, u.name, u.image, u.lat, u.lng, u.locationName, u.locationUpdatedAt,
              v.make as vehicleMake, v.model as vehicleModel, v.licensePlate as vehicleLicense
       FROM user u
       LEFT JOIN vehicle v ON v.driverId = u.id
       WHERE u.role = 'driver' AND u.lat IS NOT NULL AND u.lng IS NOT NULL
       ORDER BY u.locationUpdatedAt DESC`,
    )
    .all() as DriverLocation[];

  return NextResponse.json({ drivers });
}
