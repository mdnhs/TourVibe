import { db } from "@/lib/db";
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

  const bookings = isSuperAdmin
    ? (db
        .prepare(
          `SELECT b.*, tp.name as tourName, tp.thumbnail as tourThumbnail, tp.duration as tourDuration,
                  u.name as userName, u.email as userEmail, u.image as userImage
           FROM booking b
           JOIN tour_package tp ON b.tourPackageId = tp.id
           JOIN user u ON b.userId = u.id
           ORDER BY b.createdAt DESC`,
        )
        .all() as Booking[])
    : (db
        .prepare(
          `SELECT b.*, tp.name as tourName, tp.thumbnail as tourThumbnail, tp.duration as tourDuration,
                  u.name as userName, u.email as userEmail, u.image as userImage
           FROM booking b
           JOIN tour_package tp ON b.tourPackageId = tp.id
           JOIN user u ON b.userId = u.id
           WHERE b.userId = ?
           ORDER BY b.createdAt DESC`,
        )
        .all(session.user.id) as Booking[]);

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
