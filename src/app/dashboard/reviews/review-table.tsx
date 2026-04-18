"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  LayoutIcon,
  MoreHorizontal,
  Pencil,
  Star,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { deleteReview, deleteReviews } from "./actions";
import Link from "next/link";
import { DateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Review = {
  id: string;
  tourPackageId: string;
  tourPackageName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  reviewerImage: string | null;
  createdAt: string;
};

interface ReviewTableProps {
  reviews: Review[];
  currentUserId: string;
  isSuperAdmin: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "size-3.5",
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewTable({
  reviews,
  currentUserId,
  isSuperAdmin,
}: ReviewTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<Review[]>(() => reviews);

  React.useEffect(() => {
    setData(reviews);
  }, [reviews]);

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
  const [ratingFilter, setRatingFilter] = useQueryState(
    "rating",
    parseAsString.withDefault("all").withOptions({ shallow: true }),
  );

  const [from, setFrom] = useQueryState(
    "from",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );

  const dateRange = React.useMemo<DateRange | undefined>(() => {
    if (!from) return undefined;
    return {
      from: new Date(from),
      to: to ? new Date(to) : undefined,
    };
  }, [from, to]);

  const setDateRange = (range: DateRange | undefined) => {
    setFrom(range?.from ? range.from.toISOString() : null);
    setTo(range?.to ? range.to.toISOString() : null);
  };

  const [viewId, setViewId] = useQueryState("view", { shallow: true });

  const activeReview = React.useMemo(() => {
    return data.find((r) => r.id === viewId);
  }, [data, viewId]);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.tourPackageName.toLowerCase().includes(s) ||
          r.userName.toLowerCase().includes(s) ||
          r.userEmail.toLowerCase().includes(s) ||
          (r.comment && r.comment.toLowerCase().includes(s)),
      );
    }

    if (ratingFilter !== "all") {
      const r = parseInt(ratingFilter);
      result = result.filter((review) => review.rating === r);
    }

    if (dateRange?.from) {
      const start = startOfDay(dateRange.from);
      const end = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from);
      result = result.filter((review) => {
        const date = new Date(review.createdAt);
        return isWithinInterval(date, { start, end });
      });
    }

    return result;
  }, [data, search, ratingFilter, dateRange]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isPending, startTransition] = React.useTransition();

  const pagination = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: pageSize,
    }),
    [page, pageSize],
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      startTransition(async () => {
        const result = await deleteReview(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Review deleted successfully");
          setData((prev) => prev.filter((r) => r.id !== id));
          router.refresh();
        }
      });
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} reviews?`)
    ) {
      startTransition(async () => {
        const result = await deleteReviews(selectedIds);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Reviews deleted successfully");
          setData((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
          setRowSelection({});
          router.refresh();
        }
      });
    }
  };

  const dayCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const review of data) {
      const key = new Date(review.createdAt).toISOString().slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [data]);

  const columns: ColumnDef<Review>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const canManage = isSuperAdmin || row.original.userId === currentUserId;
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            disabled={!canManage}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "tourPackageName",
      header: "Tour Package",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.tourPackageName}</div>
      ),
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => {
        const review = row.original;
        const name = review.reviewerName || review.userName;
        const image = review.reviewerImage || review.userImage;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={image || ""} />
              <AvatarFallback>{name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-xs text-muted-foreground">
                {review.userEmail}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => <StarRating rating={row.original.rating} />,
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground italic">
          {row.original.comment || "No comment"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        const review = row.original;
        const canManage = isSuperAdmin || review.userId === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="size-8 text-muted-foreground"
                  size="icon"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setViewId(review.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/reviews/${review.id}/edit`}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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

  const handleClose = () => {
    setViewId(null);
  };

  if (viewId && activeReview) {
    const canManage = isSuperAdmin || activeReview.userId === currentUserId;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              Review Details
            </h2>
          </div>
          {canManage && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/reviews/${activeReview.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Edit Review
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Tour Package
                </p>
                <p className="text-sm font-semibold">
                  {activeReview.tourPackageName}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Reviewer
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        activeReview.reviewerImage ||
                        activeReview.userImage ||
                        ""
                      }
                    />
                    <AvatarFallback>
                      {
                        (activeReview.reviewerName ||
                          activeReview.userName)?.[0]
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">
                      {activeReview.reviewerName || activeReview.userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activeReview.userEmail}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Date
                </p>
                <p className="text-sm font-semibold">
                  {new Date(activeReview.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rating & Comment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                  Rating
                </p>
                <StarRating rating={activeReview.rating} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Comment
                </p>
                <div className="p-3 rounded-lg border bg-accent/50 min-h-[100px] text-sm italic">
                  {activeReview.comment || "No comment provided."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={ratingFilter}
            onValueChange={setRatingFilter}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              {[5, 4, 3, 2, 1].map((star) => (
                <TabsTrigger
                  key={star}
                  value={star.toString()}
                  className="flex items-center gap-1"
                >
                  {star} <Star className="size-3 fill-current" />
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <DateRangePicker
              date={dateRange}
              setDate={setDateRange}
              dayCounts={dayCounts}
            />
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-[200px] lg:w-[300px]"
              />
            </div>
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="size-4" />
                <span>
                  Delete Selected ({Object.keys(rowSelection).length})
                </span>
              </Button>
            )}

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
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No reviews found.
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
  table: ReturnType<typeof useReactTable<Review>>;
}) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        {/* Rows per page */}
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
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        {/* Nav buttons */}
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
