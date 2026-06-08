"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  CreditCard,
  Calendar,
  Car,
  Clock,
  User,
  Users,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";

export interface InvoiceData {
  id: string;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentType: string;
  paymentStage: string;
  currency: string;
  status: string;
  createdAt: string;
  tourName: string;
  tourDuration: string;
  userName: string;
  userEmail: string;
  whatsapp?: string;
  isGuest?: boolean;
  hours: number | null;
  persons: number;
  startTime: string | null;
  vehicleName: string | null;
  vehiclePlate: string | null;
}

export interface InvoiceCompany {
  name: string;
  tagline?: string;
  email?: string;
  logoUrl?: string;
  website?: string;
}

const DEFAULT_COMPANY: InvoiceCompany = {
  name: "TourVibe",
  tagline: "Premium Car Tours",
  email: "support@tourvibe.com",
  website: "tourvibe.com",
};

export function InvoiceView({
  booking,
  company = DEFAULT_COMPANY,
}: {
  booking: InvoiceData;
  company?: InvoiceCompany;
}) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const companyWebsite =
    company.website ||
    (company.email?.includes("@") ? company.email.split("@")[1] : undefined);

  const invoiceNumber =
    booking.id.length > 16
      ? booking.id.slice(0, 8).toUpperCase()
      : booking.id.toUpperCase();
  const isPaid = booking.paymentStage === "FULLY_PAID";
  const isAdvancePaid = booking.paymentStage === "ADVANCE_PAID";
  const [balanceLoading, setBalanceLoading] = React.useState(false);

  const handlePayBalance = async () => {
    try {
      setBalanceLoading(true);
      const payload: { bookingId: string; whatsapp?: string } = {
        bookingId: booking.id,
      };
      if (booking.isGuest) {
        const entered = window.prompt(
          "Enter the WhatsApp number used for this booking (international format, e.g. +14155551234):",
          "",
        );
        if (!entered) {
          setBalanceLoading(false);
          return;
        }
        payload.whatsapp = entered;
      }
      const res = await fetch("/api/checkout/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to start balance payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setBalanceLoading(false);
    }
  };

  const statusConfig = isAdvancePaid
    ? {
        color: "#d97706",
        bg: "#fffbeb",
        label: "Advance Paid · Balance Due",
        icon: <CreditCard className="size-3.5" />,
      }
    : {
        paid: {
          color: "#059669",
          bg: "#ecfdf5",
          label: "Paid",
          icon: <ShieldCheck className="size-3.5" />,
        },
        pending: {
          color: "#d97706",
          bg: "#fffbeb",
          label: "Pending",
          icon: <Calendar className="size-3.5" />,
        },
        unpaid: {
          color: "#d97706",
          bg: "#fffbeb",
          label: "Awaiting Payment",
          icon: <CreditCard className="size-3.5" />,
        },
        cancelled: {
          color: "#dc2626",
          bg: "#fef2f2",
          label: "Cancelled",
          icon: <CreditCard className="size-3.5" />,
        },
      }[booking.status] || {
        color: "#64748b",
        bg: "#f1f5f9",
        label: booking.status,
        icon: null,
      };

  const currencySymbol = getCurrencySymbol(booking.currency);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formattedAmount = fmt(booking.totalAmount || booking.amount);
  const formattedPaid = fmt(booking.paidAmount);
  const formattedDue = fmt(booking.dueAmount);

  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const durationLabel =
    booking.hours != null
      ? `${booking.hours} ${booking.hours === 1 ? "hour" : "hours"}`
      : booking.tourDuration;
  const tripDate = booking.startTime
    ? new Date(booking.startTime).toLocaleString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Standard quality scale
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7); // Use JPEG with 70% quality to significantly reduce size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true, // Enable PDF compression
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pageWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Contain within a single A4 page
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }
      const offsetX = (pageWidth - imgWidth) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        offsetX,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );
      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const el = invoiceRef.current;
    if (el) {
      // A4 portrait @96dpi = 794 x 1123 px. Scale card to fit a single page (0.97 safety).
      const scale =
        Math.min(794 / el.offsetWidth, 1123 / el.offsetHeight) * 0.97;
      el.style.setProperty("--print-scale", String(Math.min(scale, 1)));
    }
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 py-8 animate-in fade-in duration-700 print-invoice-root">
      {/* Action Bar */}
      <div className="mx-4 lg:mx-auto w-full max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit hover:bg-slate-100 transition-colors rounded-lg"
        >
          <Link href={booking.isGuest ? "/" : "/dashboard/bookings"}>
            <ArrowLeft className="mr-2 size-4" />
            {booking.isGuest ? "Back to home" : "Back to Bookings"}
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 rounded-lg"
          >
            <Printer className="mr-2 size-4" />
            Print Invoice
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-9 shadow-sm rounded-lg"
          >
            <Download className="mr-2 size-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="mx-4 lg:mx-auto w-full max-w-4xl flex justify-center bg-slate-50 p-4 md:p-12 print:bg-white print:p-0">
        <div
          ref={invoiceRef}
          className="w-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-none overflow-hidden print:shadow-none print-invoice-card"
          style={{
            maxWidth: "800px",
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Header */}
          <div className="print-row bg-slate-900 p-8 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="size-14 flex items-center justify-center text-3xl ">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="size-full object-cover"
                  />
                ) : (
                  "🚗"
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {company.name}
                </h1>
                {company.tagline && (
                  <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
                    {company.tagline}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left md:text-right relative z-10">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
                Invoice Number
              </h2>
              <p className="text-3xl font-mono font-bold text-orange-500 mb-2">
                #{invoiceNumber}
              </p>
              <div className="flex items-center md:justify-end gap-2 text-slate-300 text-sm">
                <Calendar className="size-3.5" />
                <span>Issued on {invoiceDate}</span>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Status & Quick Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-bottom border-slate-100 border-b">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"
                  style={{
                    background: statusConfig.bg,
                    color: statusConfig.color,
                  }}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {isPaid && (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Verified Payment
                  </span>
                )}
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {currencySymbol}
                    {formattedAmount}
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="print-grid-2 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="size-3" />
                  Billed To
                </h3>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-lg font-bold text-slate-900 mb-1">
                    {booking.userName}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail className="size-3.5 text-slate-400" />
                    {booking.userEmail}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="size-3" />
                  From
                </h3>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-lg font-bold text-slate-900 mb-1">
                    {company.name}
                  </p>
                  {company.email && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Mail className="size-3.5 text-slate-400" />
                      {company.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="mb-8 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="size-3" />
                Trip Details
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Calendar className="size-3" /> Trip Date
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {tripDate ?? "—"}
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Clock className="size-3" /> Duration
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {durationLabel}
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Users className="size-3" /> Guests
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.persons || 1}{" "}
                    {(booking.persons || 1) === 1 ? "guest" : "guests"}
                  </p>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    <Car className="size-3" /> Vehicle
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.vehicleName ?? "—"}
                  </p>
                  {booking.vehiclePlate && (
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {booking.vehiclePlate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Description
                    </th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Duration
                    </th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Qty
                    </th>
                    <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 mb-0.5">
                        {booking.tourName}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Premium Tour Package Experience
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-slate-600">
                      {durationLabel}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-medium text-slate-600">
                      {booking.persons || 1} pax
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {currencySymbol}
                      {formattedAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-[320px] space-y-3">
                <div className="flex justify-between text-sm text-slate-500 font-medium px-2">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-semibold">
                    {currencySymbol}
                    {formattedAmount}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium px-2">
                  <span>Tax (0.00%)</span>
                  <span className="text-slate-900 font-semibold">
                    {currencySymbol}0.00
                  </span>
                </div>
                <div className="flex justify-between text-sm text-emerald-700 font-medium px-2">
                  <span>
                    Paid (
                    {booking.paymentType === "ADVANCE" ? "20% advance" : "full"}
                    )
                  </span>
                  <span className="font-semibold">
                    {currencySymbol}
                    {formattedPaid}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-between items-center rounded-xl p-4 mt-4 shadow-lg transition-transform hover:scale-[1.02] duration-300",
                    isPaid
                      ? "bg-emerald-600 text-white shadow-emerald-600/10"
                      : "bg-slate-900 text-white shadow-slate-900/10",
                  )}
                >
                  <span className="font-bold tracking-wide uppercase text-[10px] opacity-70">
                    {isPaid ? "Paid in full" : "Balance Due"}
                  </span>
                  <span className="text-xl font-black">
                    {currencySymbol}
                    {isPaid ? formattedAmount : formattedDue}
                  </span>
                </div>

                {isAdvancePaid && (
                  <Button
                    onClick={handlePayBalance}
                    disabled={balanceLoading}
                    className="w-full h-11 mt-2 print:hidden"
                  >
                    {balanceLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Starting payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="size-4 mr-2" />
                        Pay balance now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Transaction ID */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Transaction Reference
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-900 leading-none">
                    {booking.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <ShieldCheck className="size-3.5" />
                SECURE TRANSACTION
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400 font-medium">
              Thank you for traveling with {company.name}. We hope you enjoy
              your tour!
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-900">
              <span className="opacity-40">
                &copy; {new Date().getFullYear()} {company.name}
              </span>
              {companyWebsite && (
                <>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{companyWebsite}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          /* Keep background colors/gradients when printing */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Keep multi-column layouts side-by-side in print (md/sm breakpoints don't apply to print width) */
          .print-grid-2 {
            grid-template-columns: 1fr 1fr !important;
          }
          .print-row {
            flex-direction: row !important;
            align-items: center !important;
          }
          /* Hide everything */
          body * {
            visibility: hidden;
          }
          /* Show only the invoice card */
          .print-invoice-card,
          .print-invoice-card * {
            visibility: visible;
          }
          /* Force the card to the top-left and scale (zoom reflows so it fits one A4 page) */
          .print-invoice-card {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            width: 794px !important;
            max-width: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            zoom: var(--print-scale, 1);
          }
          /* Ensure no backgrounds or shadows from parent containers */
          body,
          html {
            background: white !important;
          }
          .animate-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  color: "#94a3b8",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: 14,
};

const totalRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
  fontSize: 14,
  color: "#64748b",
  borderBottom: "1px solid #f1f5f9",
};
