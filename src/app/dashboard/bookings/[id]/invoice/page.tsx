import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { notFound, redirect } from "next/navigation";
import { InvoiceView } from "./invoice-view";
import { CheckCircle2 } from "lucide-react";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";
import { getSiteConfig } from "@/app/dashboard/site-config/actions";

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { session, role, isSuperAdmin } = await requireDashboardSession();
  const { id } = await params;
  const { success } = await searchParams;

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/bookings/${id}/invoice`);
  }

  let booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tourPackage: {
        select: {
          name: true,
          duration: true,
          vehicles: { select: { vehicle: { select: { driverId: true } } } },
        },
      },
      user: { select: { name: true, email: true } },
      vehicle: { select: { make: true, model: true, year: true, licensePlate: true } },
    },
  });

  if (!booking) {
    notFound();
  }

  const isDriver = role === "driver";
  const isAssignedDriver =
    isDriver &&
    booking.tourPackage.vehicles.some(
      (tv) => tv.vehicle.driverId === session.user.id,
    );

  // Security check: admin, owning user, or driver assigned to the tour's fleet
  const isOwner = booking.userId != null && booking.userId === session.user.id;
  if (!isSuperAdmin && !isOwner && !isAssignedDriver) {
    redirect("/dashboard/bookings");
  }

  // If redirected from successful payment but webhook hasn't synced yet
  if (
    success === "true" &&
    booking.paymentStage !== "FULLY_PAID" &&
    (booking.stripeSessionId || booking.balanceStripeSessionId)
  ) {
    try {
      const integrations = await getIntegrations();
      if (integrations.stripeSecretKey) {
        const stripe = new Stripe(integrations.stripeSecretKey, {
          apiVersion: "2023-10-16" as any,
        });
        const sessionIdToCheck = booking.balanceStripeSessionId ?? booking.stripeSessionId!;
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionIdToCheck);

        if (stripeSession.payment_status === "paid") {
          const kind = stripeSession.metadata?.kind ?? booking.paymentType;
          const paidNow = (stripeSession.amount_total ?? 0) / 100;
          const newPaidAmount =
            Math.round((booking.paidAmount + paidNow) * 100) / 100;
          const newDueAmount = Math.max(
            0,
            Math.round((booking.totalAmount - newPaidAmount) * 100) / 100,
          );
          const paymentStage =
            kind === "ADVANCE" && newDueAmount > 0 ? "ADVANCE_PAID" : "FULLY_PAID";
          const status = paymentStage === "FULLY_PAID" ? "paid" : "advance_paid";

          booking = await prisma.booking.update({
            where: { id },
            data: {
              paidAmount: newPaidAmount,
              dueAmount: newDueAmount,
              paymentStage,
              status,
            },
            include: {
              tourPackage: {
                select: {
                  name: true,
                  duration: true,
                  vehicles: { select: { vehicle: { select: { driverId: true } } } },
                },
              },
              user: { select: { name: true, email: true } },
              vehicle: { select: { make: true, model: true, year: true, licensePlate: true } },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error verifying payment on invoice page:", error);
    }
  }

  const invoiceData = {
    id: booking.id,
    amount: Number(booking.amount),
    totalAmount: Number(booking.totalAmount),
    paidAmount: Number(booking.paidAmount),
    dueAmount: Number(booking.dueAmount),
    paymentType: booking.paymentType,
    paymentStage: booking.paymentStage,
    currency: booking.currency,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    tourName: booking.tourPackage.name,
    tourDuration: booking.tourPackage.duration,
    userName: booking.user?.name ?? booking.guestName ?? "Guest",
    userEmail: booking.user?.email ?? booking.guestEmail ?? "",
    whatsapp: booking.whatsapp ?? "",
    isGuest: !booking.userId,
    hours:
      booking.startTime && booking.endTime
        ? Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / 3_600_000)
        : null,
    persons: booking.persons,
    startTime: booking.startTime ? booking.startTime.toISOString() : null,
    vehicleName: booking.vehicle
      ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.year})`
      : null,
    vehiclePlate: booking.vehicle?.licensePlate ?? null,
  };

  const site = await getSiteConfig();
  const company = {
    name: site.siteName,
    tagline: site.tagline,
    email: site.contactEmail,
    logoUrl: site.logoUrl,
  };

  return (
    <div className="flex flex-col gap-6">
      {success === "true" && (
        <div className="mx-4 lg:mx-6 mt-6 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="font-semibold">
              {invoiceData.paymentStage === "FULLY_PAID"
                ? "Payment Successful!"
                : "Advance Payment Received"}
            </p>
            <p className="text-sm text-emerald-700/80">
              {invoiceData.paymentStage === "FULLY_PAID"
                ? "Your tour has been successfully booked. Your invoice is ready below."
                : `20% advance recorded. Balance due before your tour date.`}
            </p>
          </div>
        </div>
      )}
      <InvoiceView booking={invoiceData} company={company} />
    </div>
  );
}
