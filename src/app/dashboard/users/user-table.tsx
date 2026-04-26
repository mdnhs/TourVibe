"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  ChevronLeft,
  Eye,
  MoreVertical,
  Pencil,
  ShieldCheck,
  Trash,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from "nuqs";

import { deleteUser, deleteUsers, banUser, unbanUser } from "./actions";
import { EditUserForm } from "./user-forms";
import { roleLabels } from "@/lib/permissions";

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
  const data = users;
  const [isPending, startTransition] = React.useTransition();

  const allRoleLabels = { ...roleLabels, ...customRoles } as Record<string, string>;

  // nuqs for View/Edit
  const [viewId, setViewId] = useQueryState("view", { shallow: true });
  const [editId, setEditId] = useQueryState("edit", { shallow: true });

  const activeUser = React.useMemo(() => {
    const id = viewId || editId;
    return data.find((u) => u.id === id);
  }, [data, viewId, editId]);

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
        router.refresh();
      }
    });
  };

  const columns: ColumnDef<User>[] = [
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
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={row.original.id === currentUserId}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        const isDefault = role in roleLabels;
        const label = allRoleLabels[role] ?? role;
        return (
          <Badge
            variant={isDefault ? "secondary" : "outline"}
            className={isDefault ? "capitalize" : "capitalize border-violet-200 bg-violet-50 text-violet-700"}
          >
            {label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "banned",
      id: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
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
      filterFn: (row, id, value) => {
        if (value.includes("banned")) return row.getValue(id) === true;
        if (value.includes("active")) return row.getValue(id) === false;
        return true;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;
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

  const handleClose = () => {
    setViewId(null);
    setEditId(null);
  };

  if (editId && activeUser) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 px-4 lg:px-6">
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
                    <Badge variant="secondary">{allRoleLabels[activeUser.role] ?? activeUser.role}</Badge>
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

  const roleOptions = [
    { label: "Admins", value: "super_admin" },
    { label: "Drivers", value: "driver" },
    { label: "Tourists", value: "tourist" },
    ...Object.entries(customRoles).map(([key, label]) => ({ label, value: key })),
  ];

  return (
    <div className="px-4 lg:px-6">
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search by name or email..."
        facetedFilters={[
          {
            columnKey: "role",
            title: "Role",
            options: roleOptions,
          },
          {
            columnKey: "status",
            title: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Banned", value: "banned" },
            ],
          },
        ]}
      />
    </div>
  );
}
