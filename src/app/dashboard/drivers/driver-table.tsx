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
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";

import { deleteDriver, deleteDrivers } from "./actions";
import { EditDriverForm } from "./driver-forms";

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

export type Driver = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  vehicleId: string | null;
  vehicleName?: string;
  vehiclePlate?: string;
};

interface DriverTableProps {
  drivers: Driver[];
}

export function DriverTable({ drivers }: DriverTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<Driver[]>(() => drivers);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setData(drivers);
  }, [drivers]);

  // nuqs for View/Edit
  const [viewId, setViewId] = useQueryState("view", { shallow: true });
  const [editId, setEditId] = useQueryState("edit", { shallow: true });

  const activeDriver = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((d) => d.id === id);
  }, [data, viewId, editId]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      startTransition(async () => {
        const result = await deleteDriver(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Driver deleted successfully");
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<Driver>[] = [
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
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="size-4 text-primary" />
          </div>
          <div className="font-medium">{row.original.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "vehicleId",
      id: "vehicleStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Vehicle" />
      ),
      cell: ({ row }) => {
        const { vehicleName, vehiclePlate } = row.original;
        return vehicleName ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{vehicleName}</span>
            <Badge variant="outline" className="w-fit px-1.5 text-[10px] font-mono">
              {vehiclePlate}
            </Badge>
          </div>
        ) : (
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            No Vehicle
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const hasVehicle = !!row.getValue(id);
        if (value.includes("with-vehicle")) return hasVehicle;
        if (value.includes("without-vehicle")) return !hasVehicle;
        return true;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original;
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
              <DropdownMenuItem onClick={() => setViewId(driver.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditId(driver.id)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(driver.id)}
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

  if (editId && activeDriver) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Edit Driver</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <EditDriverForm 
              driver={activeDriver} 
              onSuccess={handleClose} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewId && activeDriver) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Driver Overview</h2>
          </div>
          <Button variant="outline" onClick={() => { setViewId(null); setEditId(activeDriver.id); }}>
            <Pencil className="mr-2 size-4" />
            Edit Driver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                    <p className="text-lg font-semibold">{activeDriver.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                    <p className="text-lg font-semibold">{activeDriver.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Joined Date</p>
                    <p className="text-sm">{new Date(activeDriver.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Account Status</p>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                {activeDriver.vehicleId ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border bg-accent/50">
                      <p className="text-sm font-bold">{activeDriver.vehicleName}</p>
                      <Badge variant="outline" className="mt-1 font-mono">{activeDriver.vehiclePlate}</Badge>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/dashboard/vehicles?view=${activeDriver.vehicleId}`}>View Vehicle Details</a>
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground italic">No vehicle assigned</p>
                    <Button variant="link" size="sm" asChild>
                      <a href="/dashboard/vehicles">Assign a vehicle</a>
                    </Button>
                  </div>
                )}
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
        data={drivers}
        searchKey="name"
        searchPlaceholder="Search drivers..."
        facetedFilters={[
          {
            columnKey: "vehicleStatus",
            title: "Vehicle Status",
            options: [
              { label: "With Vehicle", value: "with-vehicle" },
              { label: "Without Vehicle", value: "without-vehicle" },
            ],
          },
        ]}
      />
    </div>
  );
}
