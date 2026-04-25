"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Download, Printer, CreditCard, Calendar, User, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";

export interface InvoiceData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  tourName: string;
  tourDuration: string;
  userName: string;
  userEmail: string;
}

export function InvoiceView({ booking }: { booking: InvoiceData }) {
  const invoiceRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const invoiceNumber = booking.id.slice(0, 8).toUpperCase();
  const isPaid = booking.status === "paid";
  
  const statusConfig = {
    paid: {
      color: "#059669",
      bg: "#ecfdf5",
      label: "Paid",
      icon: <ShieldCheck className="size-3.5" />
    },
    pending: {
      color: "#d97706",
      bg: "#fffbeb",
      label: "Pending",
      icon: <Calendar className="size-3.5" />
    },
    cancelled: {
      color: "#dc2626",
      bg: "#fef2f2",
      label: "Cancelled",
      icon: <CreditCard className="size-3.5" />
    }
  }[booking.status] || {
    color: "#64748b",
    bg: "#f1f5f9",
    label: booking.status,
    icon: null
  };

  const currencySymbol = getCurrencySymbol(booking.currency);
  const formattedAmount = booking.amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        compress: true // Enable PDF compression
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`invoice-${invoiceNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 py-8 animate-in fade-in duration-700">
      {/* Action Bar */}
      <div className="mx-4 lg:mx-auto w-full max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Button asChild variant="ghost" size="sm" className="w-fit hover:bg-slate-100 transition-colors rounded-lg">
          <Link href="/dashboard/bookings">
            <ArrowLeft className="mr-2 size-4" />
            Back to Bookings
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-9 rounded-lg">
            <Printer className="mr-2 size-4" />
            Print Invoice
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={isDownloading} className="h-9 shadow-sm rounded-lg">
            <Download className="mr-2 size-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="mx-4 lg:mx-auto w-full max-w-4xl flex justify-center bg-slate-50 p-4 md:p-12 print:bg-white print:p-0">
        <div
          ref={invoiceRef}
          className="w-full bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] rounded-none overflow-hidden print:shadow-none"
          style={{ 
            maxWidth: "800px",
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Header */}
          <div className="bg-slate-900 p-10 md:p-14 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="size-14 bg-orange-500 rounded-xl flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20">
                🚗
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">TourVibe</h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Premium Car Tours</p>
              </div>
            </div>

            <div className="text-left md:text-right relative z-10">
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">Invoice Number</h2>
              <p className="text-3xl font-mono font-bold text-orange-500 mb-2">#{invoiceNumber}</p>
              <div className="flex items-center md:justify-end gap-2 text-slate-300 text-sm">
                <Calendar className="size-3.5" />
                <span>Issued on {invoiceDate}</span>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-14">
            {/* Status & Quick Info */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-8 border-bottom border-slate-100 border-b">
              <div className="flex items-center gap-3">
                <span 
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"
                  style={{ background: statusConfig.bg, color: statusConfig.color }}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {isPaid && (
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Verified Payment</span>
                )}
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-slate-900">{currencySymbol}{formattedAmount}</p>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="size-3" />
                  Billed To
                </h3>
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-lg font-bold text-slate-900 mb-1">{booking.userName}</p>
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
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-lg font-bold text-slate-900 mb-1">TourVibe Inc.</p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Mail className="size-3.5 text-slate-400" />
                    support@tourvibe.com
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-10 overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</th>
                    <th className="text-center py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                    <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="py-6 px-6">
                      <p className="font-bold text-slate-900 mb-0.5">{booking.tourName}</p>
                      <p className="text-xs text-slate-500 font-medium">Premium Tour Package Experience</p>
                    </td>
                    <td className="py-6 px-6 text-center text-sm font-medium text-slate-600">{booking.tourDuration}</td>
                    <td className="py-6 px-6 text-center text-sm font-medium text-slate-600">01</td>
                    <td className="py-6 px-6 text-right font-bold text-slate-900">
                      {currencySymbol}{formattedAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-14">
              <div className="w-full max-w-[300px] space-y-3">
                <div className="flex justify-between text-sm text-slate-500 font-medium px-2">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-semibold">{currencySymbol}{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium px-2">
                  <span>Tax (0.00%)</span>
                  <span className="text-slate-900 font-semibold">{currencySymbol}0.00</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white rounded-xl p-4 mt-4 shadow-lg shadow-slate-900/10 transition-transform hover:scale-[1.02] duration-300">
                  <span className="font-bold tracking-wide uppercase text-[10px] opacity-70">Total Amount Due</span>
                  <span className="text-xl font-black">{currencySymbol}{formattedAmount}</span>
                </div>
              </div>
            </div>

            {/* Transaction ID */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="size-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                  <CreditCard className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Transaction Reference</p>
                  <p className="text-xs font-mono font-bold text-slate-900 leading-none">{booking.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <ShieldCheck className="size-3.5" />
                SECURE TRANSACTION
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/50 p-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-400 font-medium">Thank you for traveling with TourVibe. We hope you enjoy your tour!</p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-900">
              <span className="opacity-40">&copy; {new Date().getFullYear()} TourVibe Inc.</span>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span>tourvibe.com</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
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
