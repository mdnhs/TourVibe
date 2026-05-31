import type { Prisma, PrismaClient } from "@prisma/client";

export const VEHICLE_UNAVAILABLE_MESSAGE =
  "This vehicle is already booked for the selected date. Please choose another vehicle or contact support.";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export interface AvailabilityConflict {
  bookingId: string;
  startTime: Date;
  endTime: Date;
}

export async function findVehicleConflict(
  client: PrismaLike,
  params: {
    vehicleId: string;
    start: Date;
    end: Date;
    excludeBookingId?: string;
  },
): Promise<AvailabilityConflict | null> {
  const { vehicleId, start, end, excludeBookingId } = params;

  const conflict = await client.booking.findFirst({
    where: {
      vehicleId,
      status: { not: "cancelled" },
      startTime: { lt: end },
      endTime: { gt: start },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true, startTime: true, endTime: true },
  });

  if (!conflict || !conflict.startTime || !conflict.endTime) return null;
  return {
    bookingId: conflict.id,
    startTime: conflict.startTime,
    endTime: conflict.endTime,
  };
}

export async function isVehicleAvailable(
  client: PrismaLike,
  params: {
    vehicleId: string;
    start: Date;
    end: Date;
    excludeBookingId?: string;
  },
): Promise<boolean> {
  return (await findVehicleConflict(client, params)) === null;
}
