import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceView } from "@/app/dashboard/bookings/[id]/invoice/invoice-view";
import { CheckCircle2 } from "lucide-react";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";

export default async function PublicBookingConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;

  let booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tourPackage: { select: { name: true, duration: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!booking) {
    notFound();
  }

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
        const sessionIdToCheck =
          booking.balanceStripeSessionId ?? booking.stripeSessionId!;
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
            data: { paidAmount: newPaidAmount, dueAmount: newDueAmount, paymentStage, status },
            include: {
              tourPackage: { select: { name: true, duration: true } },
              user: { select: { name: true, email: true } },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error verifying payment on booking page:", error);
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
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {success === "true" && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
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
                  ? "Your tour has been successfully booked."
                  : "20% advance recorded. Balance due before your tour date."}
              </p>
            </div>
          </div>
        </div>
      )}
      <InvoiceView booking={invoiceData} />
    </div>
  );
}
