"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  LayoutIcon,
  MapPin,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type Booking = {
  id: string;
  tourPackageId: string;
  amount: number;
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
  const [data, setData] = React.useState<Booking[]>(() => bookings);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setData(bookings);
  }, [bookings]);

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const [pageSize, setPageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(10).withOptions({ shallow: true }),
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all").withOptions({ shallow: true }),
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const filteredData = React.useMemo(() => {
    let result = [...data];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.tourName.toLowerCase().includes(s) ||
          b.userName.toLowerCase().includes(s) ||
          b.userEmail.toLowerCase().includes(s),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    return result;
  }, [data, search, statusFilter]);

  const pagination = React.useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const handleStatusChange = (id: string, status: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Booking marked as ${status}`);
        setData((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b)),
        );
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
        setData((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
        );
        router.refresh();
      }
    });
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "tourName",
      header: "Tour",
      size: 220,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-3 w-[220px]">
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
            <span className="font-medium truncate" title={b.tourName}>{b.tourName}</span>
          </div>
        );
      },
    },
    ...(isAdmin
      ? ([
          {
            accessorKey: "userName",
            header: "Customer",
            size: 200,
            cell: ({ row }) => {
              const b = row.original;
              return (
                <div className="flex items-center gap-2 w-[200px]">
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
      header: "Status",
      size: 110,
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;

        if (!isAdmin) {
          return (
            <div className="w-[110px]">
              <StatusBadge status={status} />
            </div>
          );
        }

        return (
          <div className="w-[110px]">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 100,
      cell: ({ row }) => (
        <div className="w-[100px] font-semibold text-emerald-600">
          ${row.original.amount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "tourDuration",
      header: "Duration",
      size: 110,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-[110px]">
          <Clock className="size-3.5" />
          {row.original.tourDuration}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Booked On",
      size: 130,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-[130px]">
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
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-[10px] font-mono text-muted-foreground w-fit max-w-[110px]">
          <CreditCard className="size-3 flex-shrink-0" />
          <span className="truncate">{row.original.id.slice(0, 8)}…</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      enableHiding: false,
      cell: ({ row }) => {
        const b = row.original;

        return (
          <div className="flex justify-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="size-8 text-muted-foreground"
                    size="icon"
                    disabled={isPending}
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
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
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater(pagination);
        setPage(next.pageIndex + 1);
        setPageSize(next.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid" className="flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Paid
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Clock className="size-3" /> Pending
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-1">
                <Ban className="size-3" /> Cancelled
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Input
              placeholder={isAdmin ? "Search by tour, customer…" : "Search tours…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-[200px] lg:w-[280px]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm">
                    <LayoutIcon className="size-4" />
                    <span className="hidden lg:inline">Columns</span>
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (col) =>
                      typeof col.accessorFn !== "undefined" && col.getCanHide(),
                  )
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) =>
                        col.toggleVisibility(!!value)
                      }
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls table={table} />
    </div>
  );
}

function PaginationControls({
  table,
}: {
  table: ReturnType<typeof useReactTable<Booking>>;
}) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredRowModel().rows.length} booking(s) total.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
