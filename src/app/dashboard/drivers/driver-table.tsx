"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
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
  Trash,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { deleteDriver, deleteDrivers } from "./actions";
import { EditDriverForm } from "./driver-forms";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

  React.useEffect(() => {
    setData(drivers);
  }, [drivers]);

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("all").withOptions({ shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const [pageSize, setPageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(10).withOptions({ shallow: true }),
  );

  // nuqs for View/Edit
  const [viewId, setViewId] = useQueryState("view", { shallow: true });
  const [editId, setEditId] = useQueryState("edit", { shallow: true });

  const activeDriver = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((d) => d.id === id);
  }, [data, viewId, editId]);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Filter by tab
    if (tab === "with-vehicle") {
      result = result.filter((d) => d.vehicleId);
    } else if (tab === "without-vehicle") {
      result = result.filter((d) => !d.vehicleId);
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.email.toLowerCase().includes(s) ||
          d.vehicleName?.toLowerCase().includes(s) ||
          d.vehiclePlate?.toLowerCase().includes(s),
      );
    }

    return result;
  }, [data, tab, search]);

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
    if (confirm("Are you sure you want to delete this driver?")) {
      startTransition(async () => {
        const result = await deleteDriver(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Driver deleted successfully");
          setData((prev) => prev.filter((d) => d.id !== id));
          router.refresh();
        }
      });
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} drivers?`)
    ) {
      startTransition(async () => {
        const result = await deleteDrivers(selectedIds);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Drivers deleted successfully");
          setData((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
          setRowSelection({});
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
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
      header: "Email",
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "vehicleName",
      header: "Assigned Vehicle",
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
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        const driver = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
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
    manualPagination: false,
  });

  const handleClose = () => {
    setViewId(null);
    setEditId(null);
  };

  // ── Render Logic ──

  if (editId && activeDriver) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
    <>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex-col justify-start gap-6"
      >
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            <TabsList>
              <TabsTrigger value="all">All Drivers</TabsTrigger>
              <TabsTrigger value="with-vehicle">
                With Vehicle{" "}
                <Badge variant="secondary" className="ml-1">
                  {data.filter((d) => d.vehicleId).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="without-vehicle">
                Without Vehicle{" "}
                <Badge variant="secondary" className="ml-1">
                  {data.filter((d) => !d.vehicleId).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm flex-1">
              <Input
                placeholder="Search drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isPending}
              >
                <Trash className="size-4" />
                <span>Delete ({Object.keys(rowSelection).length})</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm">
                    <LayoutIcon className="size-4" />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter(
                    (col) =>
                      col.getCanHide(),
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

        {/* ── Table Content ── */}
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls table={table} />
        </div>
      </Tabs>
    </>
  );
}

function PaginationControls({
  table,
}: {
  table: any;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
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
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
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
