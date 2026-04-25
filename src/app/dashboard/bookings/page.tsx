import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { BookingTable, type Booking } from "./booking-table";
import { SiteHeader } from "@/components/site-header";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { session, isSuperAdmin } = await requireDashboardSession();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/bookings");
  }

  const { success } = await searchParams;

  const rawBookings = await prisma.booking.findMany({
    where: isSuperAdmin ? undefined : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tourPackage: { select: { name: true, thumbnail: true, duration: true } },
      user: { select: { name: true, email: true, image: true } },
    },
  });

  if (success === "true" && rawBookings.length > 0) {
    redirect(`/dashboard/bookings/${rawBookings[0].id}/invoice?success=true`);
  }

  const bookings: Booking[] = rawBookings.map((b) => ({
    ...b,
    amount: Number(b.amount),
    currency: b.currency,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    tourName: b.tourPackage.name,
    tourThumbnail: b.tourPackage.thumbnail,
    tourDuration: b.tourPackage.duration,
    userName: b.user.name,
    userEmail: b.user.email,
    userImage: b.user.image,
  }));

  return (
    <>
      <SiteHeader
        title={isSuperAdmin ? "All Bookings" : "My Bookings"}
        subtitle={
          isSuperAdmin
            ? "View and manage all customer bookings"
            : "Manage your upcoming adventures and travel history"
        }
      />
      <div className="flex flex-col gap-6 py-6">
        <BookingTable
          bookings={bookings}
          isAdmin={isSuperAdmin}
        />
      </div>
    </>
  );
}
