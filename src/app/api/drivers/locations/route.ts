import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const users = await prisma.user.findMany({
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

  const drivers: DriverLocation[] = users.map((u) => ({
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

  return NextResponse.json({ drivers });
}
