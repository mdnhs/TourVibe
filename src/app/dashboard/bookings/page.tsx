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

  const bookings: Booking[] = rawBookings.map((b) => ({
    ...b,
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
        {success === "true" && (
          <div className="mx-4 lg:mx-6 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Payment Successful!</p>
              <p className="text-sm text-emerald-700/80">
                Your tour has been successfully booked. Check your details
                below.
              </p>
            </div>
          </div>
        )}

        <BookingTable bookings={bookings} isAdmin={isSuperAdmin} />
      </div>
    </>
  );
}
