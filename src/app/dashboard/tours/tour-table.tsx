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
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import Link from "next/link";

import { deleteTour, deleteTours } from "./actions";

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
}

export function TourTable({ tours, vehicles }: TourTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<TourPackage[]>(() => tours);

  React.useEffect(() => {
    setData(tours);
  }, [tours]);

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

  const [viewId, setViewId] = useQueryState("view", { shallow: true });

  const activeTour = React.useMemo(() => {
    return data.find((t) => t.id === viewId);
  }, [data, viewId]);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (tab === "with-vehicles") {
      result = result.filter((t) => (t.vehicleCount || 0) > 0);
    } else if (tab === "without-vehicles") {
      result = result.filter((t) => (t.vehicleCount || 0) === 0);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s) ||
          t.duration.toLowerCase().includes(s),
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
    if (confirm("Are you sure you want to delete this tour package?")) {
      startTransition(async () => {
        const result = await deleteTour(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Tour package deleted successfully");
          setData((prev) => prev.filter((t) => t.id !== id));
          router.refresh();
        }
      });
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} packages?`)
    ) {
      startTransition(async () => {
        const result = await deleteTours(selectedIds);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Packages deleted successfully");
          setData((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
          setRowSelection({});
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<TourPackage>[] = [
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
      header: "Package Name",
      size: 200,
      cell: ({ row }) => (
        <div className="flex items-center gap-3 w-[200px]">
          <div className="size-10 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
            <img src={row.original.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="font-medium truncate" title={row.original.name}>
            {row.original.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="font-semibold text-emerald-600">
          ${row.original.price.toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Clock className="size-3" />
          {row.original.duration}
        </div>
      ),
    },
    {
      accessorKey: "maxPersons",
      header: "Persons",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Users className="size-3.5 text-muted-foreground" />
          Up to {row.original.maxPersons}
        </div>
      ),
    },
    {
      accessorKey: "vehicleCount",
      header: "Vehicles",
      cell: ({ row }) => (
        <Badge variant={row.original.vehicleCount ? "secondary" : "outline"}>
          {row.original.vehicleCount || 0} Assigned
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        const tour = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                  size="icon"
                  data-slot="dropdown-menu-trigger"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
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
  };

  // ── Render Logic ──

  if (viewId && activeTour) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
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
                  <span className="font-bold text-emerald-600">${activeTour.price.toFixed(2)}</span>
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
    <>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            <TabsList>
              <TabsTrigger value="all">
                All Packages
                <Badge variant="secondary" className="ml-1">{data.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="with-vehicles">
                With Vehicles
                <Badge variant="secondary" className="ml-1">
                  {data.filter(t => (t.vehicleCount || 0) > 0).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="without-vehicles">
                Without Vehicles
                <Badge variant="secondary" className="ml-1">
                  {data.filter(t => (t.vehicleCount || 0) === 0).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm flex-1">
              <Input
                placeholder="Search packages..."
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
                  <Button variant="outline" size="sm" data-slot="dropdown-menu-trigger">
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

        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        colSpan={header.colSpan}
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
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
