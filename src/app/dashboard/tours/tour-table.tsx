"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronLeft,
  Eye,
  MoreVertical,
  Pencil,
  Trash,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import Link from "next/link";

import { deleteTour, deleteTours } from "./actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { formatPrice } from "@/lib/currency";

export type TourPackage = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  gallery: string | null;
  assignedVehicles?: string; // Comma separated IDs
  vehicleCount?: number;
};

interface TourTableProps {
  tours: TourPackage[];
  vehicles: { id: string; make: string; model: string; licensePlate: string }[];
  currency?: string;
}

export function TourTable({ tours, vehicles, currency }: TourTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<TourPackage[]>(() => tours);
  const [isPending, startTransition] = React.useTransition();
  const [viewId, setViewId] = useQueryState("view", { shallow: true });

  React.useEffect(() => {
    setData(tours);
  }, [tours]);

  const activeTour = React.useMemo(() => {
    return data.find((t) => t.id === viewId);
  }, [data, viewId]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tour package?")) {
      startTransition(async () => {
        const result = await deleteTour(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Tour package deleted successfully");
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<TourPackage>[] = [
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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Package Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
            <img src={row.original.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="font-medium truncate max-w-[200px]" title={row.original.name}>
            {row.original.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600">
          {formatPrice(row.original.price, currency, { decimals: 2 })}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock className="size-3" />
          {row.original.duration}
        </div>
      ),
    },
    {
      accessorKey: "maxPersons",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Persons" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Users className="size-3.5 text-muted-foreground" />
          Up to {row.original.maxPersons}
        </div>
      ),
    },
    {
      accessorKey: "vehicleCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vehicles" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.vehicleCount ? "secondary" : "outline"}>
          {row.original.vehicleCount || 0} Assigned
        </Badge>
      ),
      filterFn: (row, id, value) => {
        if (value.includes("with-vehicles")) return (row.getValue(id) as number) > 0;
        if (value.includes("without-vehicles")) return (row.getValue(id) as number) === 0;
        return true;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tour = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground"
                size="icon"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setViewId(tour.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/dashboard/tours/${tour.id}/edit`)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(tour.id)}
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (viewId && activeTour) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setViewId(null)}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Tour Overview</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tours/${activeTour.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit Package
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeTour.thumbnail && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={activeTour.thumbnail}
                      alt={activeTour.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {activeTour.gallery && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activeTour.gallery.split(",").map((url, idx) => (
                      <div key={idx} className="aspect-video rounded-lg border overflow-hidden bg-muted">
                        <img src={url.trim()} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {activeTour.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Specs</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="size-4" />
                    <span className="text-sm">Price</span>
                  </div>
                  <span className="font-bold text-emerald-600">{formatPrice(activeTour.price, currency, { decimals: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-medium text-sm">{activeTour.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    <span className="text-sm">Capacity</span>
                  </div>
                  <span className="font-medium text-sm">Up to {activeTour.maxPersons} persons</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assigned Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeTour.assignedVehicles ? (
                    vehicles.filter(v => activeTour.assignedVehicles?.split(",").includes(v.id)).map(v => (
                      <div key={v.id} className="p-2 rounded border bg-accent/50 text-xs flex justify-between items-center">
                        <span className="font-medium">{v.make} {v.model}</span>
                        <Badge variant="outline" className="font-mono text-[10px]">{v.licensePlate}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No vehicles assigned</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6">
      <DataTable
        columns={columns}
        data={tours}
        searchKey="name"
        searchPlaceholder="Search packages..."
        facetedFilters={[
          {
            columnKey: "vehicleCount",
            title: "Vehicles",
            options: [
              { label: "With Vehicles", value: "with-vehicles" },
              { label: "Without Vehicles", value: "without-vehicles" },
            ],
          },
        ]}
      />
    </div>
  );
}
