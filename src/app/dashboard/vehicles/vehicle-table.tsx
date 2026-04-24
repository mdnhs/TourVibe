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
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";

import { deleteVehicle, deleteVehicles } from "./actions";
import { EditVehicleForm } from "./vehicle-forms";

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

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  driverId: string | null;
  driverName?: string;
  driverEmail?: string;
  thumbnail: string;
  gallery?: string; // Stored as JSON string
};

interface VehicleTableProps {
  vehicles: Vehicle[];
  drivers: { id: string; name: string; email: string }[];
}

export function VehicleTable({ vehicles, drivers }: VehicleTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<Vehicle[]>(() => vehicles);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setData(vehicles);
  }, [vehicles]);

  // nuqs for View/Edit
  const [viewId, setViewId] = useQueryState("view", { shallow: true });
  const [editId, setEditId] = useQueryState("edit", { shallow: true });

  const activeVehicle = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((v) => v.id === id);
  }, [data, viewId, editId]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      startTransition(async () => {
        const result = await deleteVehicle(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Vehicle deleted successfully");
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<Vehicle>[] = [
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
      accessorKey: "make",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
            <img src={row.original.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="font-medium">{row.original.make}</div>
        </div>
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => <div>{row.original.model}</div>,
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" />
      ),
      cell: ({ row }) => <div>{row.original.year}</div>,
    },
    {
      accessorKey: "licensePlate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="License Plate" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="px-1.5 text-muted-foreground font-mono"
        >
          {row.original.licensePlate}
        </Badge>
      ),
    },
    {
      accessorKey: "driverId",
      id: "assignmentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Driver" />
      ),
      cell: ({ row }) => {
        const { driverName, driverEmail } = row.original;
        return driverName ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{driverName}</span>
            <span className="text-xs text-muted-foreground">{driverEmail}</span>
          </div>
        ) : (
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            Unassigned
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const hasDriver = !!row.getValue(id);
        if (value.includes("assigned")) return hasDriver;
        if (value.includes("unassigned")) return !hasDriver;
        return true;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original;
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
              <DropdownMenuItem onClick={() => setViewId(vehicle.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditId(vehicle.id)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(vehicle.id)}
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

  const handleClose = () => {
    setViewId(null);
    setEditId(null);
  };

  if (editId && activeVehicle) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Edit Vehicle</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <EditVehicleForm 
              vehicle={activeVehicle} 
              drivers={drivers} 
              onSuccess={handleClose} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewId && activeVehicle) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Vehicle Overview</h2>
          </div>
          <Button variant="outline" onClick={() => { setViewId(null); setEditId(activeVehicle.id); }}>
            <Pencil className="mr-2 size-4" />
            Edit Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeVehicle.thumbnail && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={activeVehicle.thumbnail}
                      alt={activeVehicle.make}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {activeVehicle.gallery && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activeVehicle.gallery.split(",").map((url, idx) => {
                      const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg");
                      return (
                        <div key={idx} className="aspect-video rounded-lg border overflow-hidden bg-muted group relative">
                          {isVideo ? (
                            <video src={url.trim()} controls className="w-full h-full object-cover" />
                          ) : (
                            <img src={url.trim()} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Name</p>
                    <p className="text-sm font-semibold">{activeVehicle.make}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Model</p>
                    <p className="text-sm font-semibold">{activeVehicle.model}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Year</p>
                    <p className="text-sm font-semibold">{activeVehicle.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">License Plate</p>
                    <Badge variant="outline" className="font-mono">{activeVehicle.licensePlate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Assigned Driver</p>
                  {activeVehicle.driverName ? (
                    <div className="p-3 rounded-lg border bg-accent/50">
                      <p className="text-sm font-bold">{activeVehicle.driverName}</p>
                      <p className="text-xs text-muted-foreground">{activeVehicle.driverEmail}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic p-3 rounded-lg border border-dashed">No driver assigned</p>
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
        data={data}
        searchKey="make"
        searchPlaceholder="Search vehicles..."
        enableRowReorder={true}
        onRowReorder={(newData) => setData(newData)}
        facetedFilters={[
          {
            columnKey: "assignmentStatus",
            title: "Assignment Status",
            options: [
              { label: "Assigned", value: "assigned" },
              { label: "Unassigned", value: "unassigned" },
            ],
          },
        ]}
      />
    </div>
  );
}
