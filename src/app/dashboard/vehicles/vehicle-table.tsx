"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  GripVertical,
  LayoutIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { deleteVehicle, deleteVehicles } from "./actions";
import { EditVehicleForm } from "./vehicle-forms";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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

// ── Drag handle ────────────────────────────────────────────────────────────────

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// ── Draggable row ──────────────────────────────────────────────────────────────

function DraggableRow({ row }: { row: Row<Vehicle> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function VehicleTable({ vehicles, drivers }: VehicleTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<Vehicle[]>(() => vehicles);

  React.useEffect(() => {
    setData(vehicles);
  }, [vehicles]);

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

  const activeVehicle = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((v) => v.id === id);
  }, [data, viewId, editId]);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Filter by tab
    if (tab === "assigned") {
      result = result.filter((v) => v.driverId);
    } else if (tab === "unassigned") {
      result = result.filter((v) => !v.driverId);
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(s) ||
          v.model.toLowerCase().includes(s) ||
          v.licensePlate.toLowerCase().includes(s) ||
          v.driverName?.toLowerCase().includes(s),
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

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => filteredData.map(({ id }) => id),
    [filteredData],
  );

  const pagination = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: pageSize,
    }),
    [page, pageSize],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = data.findIndex((v) => v.id === active.id);
        const newIndex = data.findIndex((v) => v.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      startTransition(async () => {
        const result = await deleteVehicle(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Vehicle deleted successfully");
          setData((prev) => prev.filter((v) => v.id !== id));
          router.refresh();
        }
      });
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} vehicles?`)
    ) {
      startTransition(async () => {
        const result = await deleteVehicles(selectedIds);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Vehicles deleted successfully");
          setData((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
          setRowSelection({});
          router.refresh();
        }
      });
    }
  };

  const columns: ColumnDef<Vehicle>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
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
      accessorKey: "make",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.make}</div>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => <div>{row.original.model}</div>,
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => <div>{row.original.year}</div>,
    },
    {
      accessorKey: "licensePlate",
      header: "License Plate",
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
      accessorKey: "driverName",
      header: "Assigned Driver",
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
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        const vehicle = row.original;
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

  const handleCloseSheet = () => {
    setViewId(null);
    setEditId(null);
  };

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
            {/* Mobile view selector */}
            <Label htmlFor="view-selector" className="sr-only">
              View
            </Label>
            <Select value={tab} onValueChange={setTab}>
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Select a view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>

            {/* Desktop tabs */}
            <TabsList className="hidden @4xl/main:flex">
              <TabsTrigger value="all">All Vehicles</TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned{" "}
                <Badge variant="secondary" className="ml-1">
                  {data.filter((v) => v.driverId).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unassigned">
                Unassigned{" "}
                <Badge variant="secondary" className="ml-1">
                  {data.filter((v) => !v.driverId).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm flex-1">
              <Input
                placeholder="Search vehicles..."
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
                <span>Delete Selected ({Object.keys(rowSelection).length})</span>
              </Button>
            )}

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm">
                    <LayoutIcon className="size-4" />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <span className="lg:hidden">Columns</span>
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

        {/* ── Table Content ── */}
        <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <VehicleDataGrid
            table={table}
            dataIds={dataIds}
            sortableId={sortableId}
            sensors={sensors}
            handleDragEnd={handleDragEnd}
            columns={columns}
          />
          <PaginationControls table={table} />
        </div>
      </Tabs>

      {/* ── Side Sheet for View/Edit ── */}
      <Sheet open={!!activeVehicle} onOpenChange={(open) => !open && handleCloseSheet()}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {editId ? "Edit Vehicle" : "Vehicle Details"}
            </SheetTitle>
            <SheetDescription>
              {editId 
                ? "Update vehicle information and media." 
                : "Comprehensive overview of vehicle specifications and media."
              }
            </SheetDescription>
          </SheetHeader>

          {activeVehicle && (
            <div className="space-y-8">
              {editId ? (
                <EditVehicleForm 
                  vehicle={activeVehicle} 
                  drivers={drivers} 
                  onSuccess={handleCloseSheet}
                />
              ) : (
                <div className="space-y-6">
                  {/* Media */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Media</h3>
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
                      <div className="grid grid-cols-2 gap-2">
                        {activeVehicle.gallery.split(",").map((url, idx) => {
                          const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg");
                          return (
                            <div key={idx} className="aspect-video rounded-lg border overflow-hidden bg-muted">
                              {isVideo ? (
                                <video src={url.trim()} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={url.trim()} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-6 border-t pt-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Name</p>
                      <p className="text-sm font-semibold">{activeVehicle.make}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Model</p>
                      <p className="text-sm font-semibold">{activeVehicle.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Year</p>
                      <p className="text-sm">{activeVehicle.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">License Plate</p>
                      <Badge variant="outline" className="font-mono">{activeVehicle.licensePlate}</Badge>
                    </div>
                  </div>

                  {/* Driver */}
                  <div className="border-t pt-6">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Assigned Driver</p>
                    {activeVehicle.driverName ? (
                      <div className="p-3 rounded-lg border bg-accent/50">
                        <p className="text-sm font-bold">{activeVehicle.driverName}</p>
                        <p className="text-xs text-muted-foreground">{activeVehicle.driverEmail}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No driver assigned</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 border-t pt-6">
                    <Button className="flex-1" onClick={() => { setViewId(null); setEditId(activeVehicle.id); }}>
                      <Pencil className="mr-2 size-4" />
                      Edit Vehicle
                    </Button>
                    <Button variant="outline" onClick={handleCloseSheet}>Close</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function VehicleDataGrid({
  table,
  dataIds,
  sortableId,
  sensors,
  handleDragEnd,
  columns,
}: {
  table: ReturnType<typeof useReactTable<Vehicle>>;
  dataIds: UniqueIdentifier[];
  sortableId: string;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  columns: ColumnDef<Vehicle>[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        id={sortableId}
      >
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
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              <SortableContext
                items={dataIds}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
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
      </DndContext>
    </div>
  );
}

function PaginationControls({
  table,
}: {
  table: ReturnType<typeof useReactTable<Vehicle>>;
}) {
  return (
    <div className="flex items-center justify-between px-4">
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