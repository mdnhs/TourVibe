import { prisma } from "@/lib/prisma";
import { requireDashboardSession } from "@/lib/dashboard";
import { notFound, redirect } from "next/navigation";
import { InvoiceView } from "./invoice-view";
import { CheckCircle2 } from "lucide-react";
import Stripe from "stripe";
import { getIntegrations } from "@/lib/integrations";

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { session, isSuperAdmin } = await requireDashboardSession();
  const { id } = await params;
  const { success } = await searchParams;

  if (!session) {
    redirect(`/login?callbackUrl=/dashboard/bookings/${id}/invoice`);
  }

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

  // Security check: Only allow the user who made the booking or an admin to view the invoice
  if (!isSuperAdmin && booking.userId !== session.user.id) {
    redirect("/dashboard/bookings");
  }

  // If redirected from successful payment but status hasn't updated yet (webhook delay)
  if (success === "true" && booking.status === "unpaid" && booking.stripeSessionId) {
    try {
      const integrations = await getIntegrations();
      if (integrations.stripeSecretKey) {
        const stripe = new Stripe(integrations.stripeSecretKey, {
          apiVersion: "2023-10-16" as any,
        });
        const stripeSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
        
        if (stripeSession.payment_status === "paid") {
          booking = await prisma.booking.update({
            where: { id },
            data: { status: "paid" },
            include: {
              tourPackage: { select: { name: true, duration: true } },
              user: { select: { name: true, email: true } },
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
    currency: booking.currency,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    tourName: booking.tourPackage.name,
    tourDuration: booking.tourPackage.duration,
    userName: booking.user.name ?? "Guest",
    userEmail: booking.user.email ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      {success === "true" && (
        <div className="mx-4 lg:mx-6 mt-6 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="font-semibold">Payment Successful!</p>
            <p className="text-sm text-emerald-700/80">
              Your tour has been successfully booked. Your invoice is ready
              below.
            </p>
          </div>
        </div>
      )}
      <InvoiceView booking={invoiceData} />
    </div>
  );
}
