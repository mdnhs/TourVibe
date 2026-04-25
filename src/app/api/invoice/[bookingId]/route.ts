import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrencySymbol } from "@/lib/currency";

interface BookingRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  tourName: string;
  tourDuration: string;
  tourThumbnail: string | null;
  userName: string;
  userEmail: string;
  userId: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await params;

  const raw = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tourPackage: { select: { name: true, duration: true, thumbnail: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const booking: BookingRow | undefined = raw
    ? {
        id: raw.id,
        amount: raw.amount,
        currency: raw.currency,
        status: raw.status,
        createdAt: raw.createdAt.toISOString(),
        tourName: raw.tourPackage.name,
        tourDuration: raw.tourPackage.duration,
        tourThumbnail: raw.tourPackage.thumbnail,
        userName: raw.user.name,
        userEmail: raw.user.email,
        userId: raw.user.id,
      }
    : undefined;

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isPaid = booking.status === "paid";
  const statusColor = isPaid ? "#059669" : "#d97706";
  const statusBg = isPaid ? "#ecfdf5" : "#fffbeb";
  const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
  const currencySymbol = getCurrencySymbol(booking.currency);

  const invoiceNumber = booking.id.length > 16 
    ? booking.id.slice(0, 8).toUpperCase() 
    : booking.id.toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${invoiceNumber}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 40px 20px;
    }

    .page {
      background: #fff;
      width: 100%;
      max-width: 720px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #fff;
      padding: 40px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon {
      width: 44px; height: 44px;
      background: #f97316;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }
    .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .invoice-number { font-size: 24px; font-weight: 800; margin-top: 4px; color: #f97316; }
    .invoice-date { font-size: 13px; color: #94a3b8; margin-top: 4px; }

    /* Body */
    .body { padding: 40px 48px; }

    /* Status */
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: ${statusBg};
      color: ${statusColor};
      border: 1.5px solid ${statusColor}33;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${statusColor};
    }

    /* Parties */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 36px;
    }
    .party-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
    }
    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .party-name { font-size: 15px; font-weight: 700; color: #0f172a; }
    .party-email { font-size: 13px; color: #64748b; margin-top: 4px; }

    /* Line items */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .items-table thead tr { border-bottom: 2px solid #e2e8f0; }
    .items-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94a3b8;
    }
    .items-table th:last-child { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #f1f5f9; }
    .items-table td { padding: 14px 12px; font-size: 14px; }
    .items-table td:last-child { text-align: right; font-weight: 700; }
    .item-name { font-weight: 600; color: #0f172a; }
    .item-meta { font-size: 12px; color: #94a3b8; margin-top: 3px; }

    /* Totals */
    .totals { margin-left: auto; width: 260px; }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
      color: #64748b;
      border-bottom: 1px solid #f1f5f9;
    }
    .total-row.grand {
      border-bottom: none;
      border-top: 2px solid #e2e8f0;
      margin-top: 4px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Order ID */
    .order-id-row {
      margin-top: 36px;
      padding: 16px 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .order-id-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .order-id-value { font-size: 13px; font-family: monospace; font-weight: 700; color: #0f172a; }

    /* Footer */
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-text { font-size: 12px; color: #94a3b8; }
    .footer-brand { font-size: 13px; font-weight: 700; color: #0f172a; }

    /* Print button */
    .print-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto 28px;
      width: fit-content;
      background: #0f172a;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .print-btn:hover { background: #1e293b; }

    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">🚗</div>
        <div>
          <div class="brand-name">TourVibe</div>
          <div class="brand-tagline">Car Tour Management</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-number">#${invoiceNumber}</div>
        <div class="invoice-date">${invoiceDate}</div>
      </div>
    </div>

    <div class="body">
      <div class="status-row">
        <span class="status-badge">
          <span class="status-dot"></span>
          ${statusLabel}
        </span>
      </div>

      <div class="parties">
        <div class="party-box">
          <div class="party-label">Billed To</div>
          <div class="party-name">${booking.userName}</div>
          <div class="party-email">${booking.userEmail}</div>
        </div>
        <div class="party-box">
          <div class="party-label">From</div>
          <div class="party-name">TourVibe Inc.</div>
          <div class="party-email">support@tourvibe.com</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Duration</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-name">${booking.tourName}</div>
              <div class="item-meta">Tour Package</div>
            </td>
            <td>${booking.tourDuration}</td>
            <td>1</td>
            <td>${currencySymbol}${booking.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${currencySymbol}${booking.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="total-row">
          <span>Tax (0%)</span>
          <span>${currencySymbol}0.00</span>
        </div>
        <div class="total-row grand">
          <span>Total</span>
          <span>${currencySymbol}${booking.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div class="order-id-row">
        <span class="order-id-label">Full Order ID</span>
        <span class="order-id-value">${booking.id}</span>
      </div>
    </div>

    <div class="footer">
      <span class="footer-text">Thank you for choosing TourVibe!</span>
      <span class="footer-brand">TourVibe &copy; ${new Date().getFullYear()}</span>
    </div>
  </div>

  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button class="print-btn" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <script>
    // Auto-trigger print if ?print=1 is in the URL
    if (new URLSearchParams(location.search).get('print') === '1') {
      window.addEventListener('load', () => window.print());
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache",
    },
  });
}
