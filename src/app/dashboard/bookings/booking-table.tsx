"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  MapPin,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { updateBookingStatus, cancelOwnBooking } from "./actions";
import type { BookingStatus } from "./actions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { formatPrice } from "@/lib/currency";

export type Booking = {
  id: string;
  tourPackageId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  tourName: string;
  tourThumbnail: string | null;
  tourDuration: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
};

interface BookingTableProps {
  bookings: Booking[];
  isAdmin: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  paid: {
    label: "Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="size-3" />,
  },
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="size-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <Ban className="size-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        cfg.color,
        cfg.bg,
        cfg.border,
      )}
    >
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

export function BookingTable({ bookings, isAdmin }: BookingTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleStatusChange = (id: string, status: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Booking marked as ${status}`);
        router.refresh();
      }
    });
  };

  const handleCancelOwn = (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    startTransition(async () => {
      const result = await cancelOwnBooking(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Booking cancelled");
        router.refresh();
      }
    });
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "tourName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tour" />
      ),
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              {b.tourThumbnail ? (
                <Image
                  src={b.tourThumbnail}
                  alt={b.tourName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MapPin className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <span className="font-medium truncate max-w-[180px]" title={b.tourName}>{b.tourName}</span>
          </div>
        );
      },
    },
    ...(isAdmin
      ? ([
          {
            accessorKey: "userName",
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="Customer" />
            ),
            cell: ({ row }) => {
              const b = row.original;
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={b.userImage ?? ""} />
                    <AvatarFallback>{b.userName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium truncate">{b.userName}</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {b.userEmail}
                    </span>
                  </div>
                </div>
              );
            },
          },
        ] as ColumnDef<Booking>[])
      : []),
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;

        if (!isAdmin) {
          return <StatusBadge status={status} />;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                role="button"
                tabIndex={0}
                className="inline-flex outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full transition-opacity hover:opacity-80 cursor-pointer"
              >
                <StatusBadge status={status} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground">Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  disabled={status === "paid"}
                  onClick={() => handleStatusChange(id, "paid")}
                  className="gap-2"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Mark Paid</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  disabled={status === "pending"}
                  onClick={() => handleStatusChange(id, "pending")}
                  className="gap-2"
                >
                  <Clock className="size-3.5 text-amber-600" />
                  <span>Mark Pending</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  disabled={status === "cancelled"}
                  onClick={() => handleStatusChange(id, "cancelled")}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <Ban className="size-3.5" />
                  <span>Cancel</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600">
          {formatPrice(row.original.amount, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: "tourDuration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {row.original.tourDuration}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Booked On" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-[10px] font-mono text-muted-foreground w-fit">
          <CreditCard className="size-3 flex-shrink-0" />
          <span className="truncate">{row.original.id.slice(0, 8)}…</span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const b = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 text-muted-foreground"
                size="icon"
                disabled={isPending}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAdmin ? (
                <>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Invoice</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(`/api/invoice/${b.id}`, "_blank")
                      }
                    >
                      <Download className="mr-2 size-4" />
                      Download Invoice
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuItem
                      disabled={b.status === "paid"}
                      onClick={() => handleStatusChange(b.id, "paid")}
                    >
                      <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                      Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={b.status === "pending"}
                      onClick={() => handleStatusChange(b.id, "pending")}
                    >
                      <Clock className="mr-2 size-4 text-amber-600" />
                      Mark as Pending
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={b.status === "cancelled"}
                      onClick={() => handleStatusChange(b.id, "cancelled")}
                    >
                      <Ban className="mr-2 size-4" />
                      Cancel Booking
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/tours/${b.tourPackageId}`}>
                      <ExternalLink className="mr-2 size-4" />
                      View Tour
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`/api/invoice/${b.id}`, "_blank")
                    }
                  >
                    <Download className="mr-2 size-4" />
                    Download Invoice
                  </DropdownMenuItem>
                  {b.status !== "cancelled" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isPending}
                        onClick={() => handleCancelOwn(b.id)}
                      >
                        <Ban className="mr-2 size-4" />
                        Cancel Booking
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <DataTable
        columns={columns}
        data={bookings}
        searchKey="tourName"
        searchPlaceholder={isAdmin ? "Search by tour, customer…" : "Search tours…"}
        facetedFilters={[
          {
            columnKey: "status",
            title: "Status",
            options: [
              { label: "Paid", value: "paid", icon: CheckCircle2 },
              { label: "Pending", value: "pending", icon: Clock },
              { label: "Cancelled", value: "cancelled", icon: Ban },
            ],
          },
        ]}
      />
    </div>
  );
}
