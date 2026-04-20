import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Calendar, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Booking {
  id: string;
  tourPackageId: string;
  amount: number;
  status: string;
  createdAt: string;
  tourName: string;
  tourThumbnail: string;
  tourDuration: string;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/bookings");
  }

  const { success } = await searchParams;

  const bookings = db.prepare(`
    SELECT b.*, tp.name as tourName, tp.thumbnail as tourThumbnail, tp.duration as tourDuration
    FROM booking b
    JOIN tour_package tp ON b.tourPackageId = tp.id
    WHERE b.userId = ?
    ORDER BY b.createdAt DESC
  `).all(session.user.id) as Booking[];

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 space-y-4">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-slate-950">
            My Bookings
          </h1>
          <p className="text-slate-500">Manage your upcoming adventures and view your travel history.</p>
        </div>

        {/* Success Alert */}
        {success === "true" && (
          <div className="mb-10 flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="font-bold">Payment Successful!</p>
              <p className="mt-1 text-sm text-emerald-700/80">Your tour has been successfully booked. Check your details below.</p>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full md:w-72 shrink-0 bg-slate-100">
                    {booking.tourThumbnail ? (
                      <Image
                        src={booking.tourThumbnail}
                        alt={booking.tourName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <MapPin className="size-8 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute left-4 top-4">
                      {booking.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="size-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                          <Clock className="size-3" /> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-heading text-xl font-bold text-slate-950">
                            {booking.tourName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="size-3.5" />
                              {new Date(booking.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-3.5" />
                              {booking.tourDuration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</p>
                          <p className="font-heading text-2xl font-extrabold text-slate-950">
                            ${booking.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                          <CreditCard className="size-3.5" />
                          Order ID: {booking.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end">
                      <Link
                        href={`/tours/${booking.tourPackageId}`}
                        className="text-sm font-bold text-slate-950 transition hover:text-orange-600"
                      >
                        View Tour →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <MapPin className="size-10" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-950">No bookings yet</h3>
              <p className="mt-2 text-slate-500">Explore our tours and start your next adventure.</p>
              <Link
                href="/tours"
                className="mt-8 rounded-xl bg-slate-950 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Explore Tours
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
