import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findVehicleConflict,
  VEHICLE_UNAVAILABLE_MESSAGE,
} from "@/lib/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  if (!vehicleId || !startStr || !endStr) {
    return NextResponse.json(
      { error: "vehicleId, start and end are required" },
      { status: 400 },
    );
  }

  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json(
      { error: "Invalid start/end" },
      { status: 400 },
    );
  }

  const conflict = await findVehicleConflict(prisma, { vehicleId, start, end });

  if (conflict) {
    return NextResponse.json({
      available: false,
      message: VEHICLE_UNAVAILABLE_MESSAGE,
      conflict,
    });
  }

  return NextResponse.json({ available: true });
}
