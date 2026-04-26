"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronLeft,
  Eye,
  MoreVertical,
  Pencil,
  Star,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString } from "nuqs";
import Link from "next/link";
import { DateRangePicker } from "./date-range-picker";
import { DateRange } from "react-day-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

import { deleteReview, deleteReviews } from "./actions";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";

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
  const data = reviews;
  const [isPending, startTransition] = React.useTransition();
  const [viewId, setViewId] = useQueryState("view", { shallow: true });

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

  const activeReview = React.useMemo(() => {
    return data.find((r) => r.id === viewId);
  }, [data, viewId]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      startTransition(async () => {
        const result = await deleteReview(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Review deleted successfully");
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

  const filteredByDate = React.useMemo(() => {
    if (!dateRange?.from) return data;
    const start = startOfDay(dateRange.from);
    const end = dateRange.to
      ? endOfDay(dateRange.to)
      : endOfDay(dateRange.from);
    return data.filter((review) => {
      const date = new Date(review.createdAt);
      return isWithinInterval(date, { start, end });
    });
  }, [data, dateRange]);

  const columns: ColumnDef<Review>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            table.getIsSomePageRowsSelected()
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tour Package" />
      ),
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[200px]" title={row.original.tourPackageName}>
          {row.original.tourPackageName}
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const review = row.original;
        const name = review.reviewerName || review.userName;
        const image = review.reviewerImage || review.userImage;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-8 flex-shrink-0">
              <AvatarImage src={image || ""} />
              <AvatarFallback>{name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium truncate">{name}</span>
              <span className="text-[11px] text-muted-foreground truncate">
                {review.userEmail}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rating" />
      ),
      cell: ({ row }) => <StarRating rating={row.original.rating} />,
      filterFn: (row, id, value: string[]) => {
        return value.includes(String(row.getValue(id)));
      },
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground italic text-xs" title={row.original.comment || ""}>
          {row.original.comment || "No comment"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const review = row.original;
        const canManage = isSuperAdmin || review.userId === currentUserId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 text-muted-foreground"
                size="icon"
                >
                <MoreVertical className="size-4" />
                </Button>

            </DropdownMenuTrigger>
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

  if (viewId && activeReview) {
    const canManage = isSuperAdmin || activeReview.userId === currentUserId;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewId(null)}>
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
    <div className="px-4 lg:px-6">
      <DataTable
        columns={columns}
        data={filteredByDate}
        searchKey="tourPackageName"
        searchPlaceholder="Search reviews..."
        leftToolbar={
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
            dayCounts={dayCounts}
          />
        }
        facetedFilters={[
          {
            columnKey: "rating",
            title: "Rating",
            options: [
              { label: "5 Stars", value: "5" },
              { label: "4 Stars", value: "4" },
              { label: "3 Stars", value: "3" },
              { label: "2 Stars", value: "2" },
              { label: "1 Star", value: "1" },
            ],
          },
        ]}
      />
    </div>
  );
}
