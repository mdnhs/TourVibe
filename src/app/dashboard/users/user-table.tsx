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
  Ban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  LayoutIcon,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { deleteUser, deleteUsers, banUser, unbanUser } from "./actions";
import { EditUserForm } from "./user-forms";
import { roleLabels } from "@/lib/permissions";

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

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  createdAt: string;
};

interface UserTableProps {
  users: User[];
  currentUserId: string;
  customRoles?: Record<string, string>;
}

export function UserTable({ users, currentUserId, customRoles = {} }: UserTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<User[]>(() => users);

  const allRoleLabels = { ...roleLabels, ...customRoles } as Record<string, string>;

  React.useEffect(() => {
    setData(users);
  }, [users]);

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

  const activeUser = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((u) => u.id === id);
  }, [data, viewId, editId]);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Filter by tab (roles)
    if (tab === "super_admin" || tab === "driver" || tab === "tourist") {
      result = result.filter((u) => u.role === tab);
    } else if (tab === "banned") {
      result = result.filter((u) => u.banned);
    }

    // Filter by search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s),
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
    if (id === currentUserId) {
      toast.error("You cannot delete yourself.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      startTransition(async () => {
        const result = await deleteUser(id);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("User deleted successfully");
          setData((prev) => prev.filter((u) => u.id !== id));
          router.refresh();
        }
      });
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection).filter(id => id !== currentUserId);
    if (selectedIds.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedIds.length} users?`)
    ) {
      startTransition(async () => {
        const result = await deleteUsers(selectedIds);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Users deleted successfully");
          setData((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
          setRowSelection({});
          router.refresh();
        }
      });
    }
  };

  const handleBanToggle = (user: User) => {
    if (user.id === currentUserId) {
      toast.error("You cannot ban yourself.");
      return;
    }
    startTransition(async () => {
      const result = user.banned ? await unbanUser(user.id) : await banUser(user.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(user.banned ? "User unbanned" : "User banned");
        setData((prev) => prev.map(u => u.id === user.id ? { ...u, banned: !user.banned } : u));
        router.refresh();
      }
    });
  };

  const columns: ColumnDef<User>[] = [
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
            disabled={row.original.id === currentUserId}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="size-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.name}
              {row.original.id === currentUserId && (
                <Badge variant="outline" className="ml-2 text-[10px] bg-amber-100 text-amber-800 border-amber-200">YOU</Badge>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {roleLabels[row.original.role] || row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        row.original.banned ? (
          <Badge variant="destructive" className="flex w-fit items-center gap-1">
            <Ban className="size-3" />
            Banned
          </Badge>
        ) : (
          <Badge variant="outline" className="flex w-fit items-center gap-1 bg-emerald-50 text-emerald-600 border-emerald-200">
            <ShieldCheck className="size-3" />
            Active
          </Badge>
        )
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setViewId(user.id)}>
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditId(user.id)}>
                <Pencil className="mr-2 size-4" />
                Edit / Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleBanToggle(user)}
                disabled={isSelf}
              >
                {user.banned ? (
                  <>
                    <ShieldCheck className="mr-2 size-4 text-emerald-600" />
                    Unban User
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 size-4 text-destructive" />
                    Ban User
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => handleDelete(user.id)}
                disabled={isSelf}
              >
                <Trash className="mr-2 size-4" />
                Delete Account
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

  if (editId && activeUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Edit User Settings</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <EditUserForm 
              user={activeUser} 
              onSuccess={handleClose} 
              customRoles={customRoles}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewId && activeUser) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ChevronLeft className="size-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">User Overview</h2>
          </div>
          <Button variant="outline" onClick={() => { setViewId(null); setEditId(activeUser.id); }}>
            <Pencil className="mr-2 size-4" />
            Edit User
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Full Name</p>
                    <p className="text-lg font-semibold">{activeUser.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                    <p className="text-lg font-semibold">{activeUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Role</p>
                    <Badge variant="secondary">{roleLabels[activeUser.role]}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                    {activeUser.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600">Active</Badge>
                    )}
                  </div>
                </div>
                {activeUser.banned && activeUser.banReason && (
                  <div className="space-y-1 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xs font-medium text-destructive uppercase">Ban Reason</p>
                    <p className="text-sm text-destructive">{activeUser.banReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase text-[10px]">Registration Date</p>
                  <p className="text-sm font-medium">{new Date(activeUser.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase text-[10px]">User ID</p>
                  <p className="text-[10px] font-mono bg-muted p-1 rounded break-all">{activeUser.id}</p>
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
        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4 flex-1">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-1">
                  {data.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="super_admin">
                Admins
                <Badge variant="secondary" className="ml-1">
                  {data.filter((u) => u.role === "super_admin").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="driver">
                Drivers
                <Badge variant="secondary" className="ml-1">
                  {data.filter((u) => u.role === "driver").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tourist">
                Tourists
                <Badge variant="secondary" className="ml-1">
                  {data.filter((u) => u.role === "tourist").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="banned">
                Banned
                <Badge variant="secondary" className="ml-1">
                  {data.filter((u) => u.banned).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <div className="relative max-w-sm flex-1">
              <Input
                placeholder="Search by name or email..."
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
