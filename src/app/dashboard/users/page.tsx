import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireDashboardSession } from "@/lib/dashboard";
import { UserTable, type User } from "./user-table";
import { CreateUserForm } from "./user-forms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function UsersPage() {
  const { session, isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const allUsersRaw = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const allUsers: User[] = allUsersRaw.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "tourist",
    banned: !!user.banned,
    banReason: user.banReason,
    createdAt: user.createdAt.toISOString(),
  }));

  const customRoles = await db.customRole.findMany({
    select: { name: true },
  });
  const customRoleLabels = Object.fromEntries(
    customRoles.map((r) => [r.name, r.name]),
  );

  return (
    <>
      <SiteHeader title="User Administration" subtitle="Admin only route" />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
            <p className="text-muted-foreground">
              Overview of all registered accounts in the system.
            </p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button data-slot="dialog-trigger">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New User
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with a specific role.
                </DialogDescription>
              </DialogHeader>
              <CreateUserForm customRoles={customRoleLabels} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-xs">
          <CardContent className="p-0">
            <div className="p-6">
               <UserTable 
                currentUserId={session.user.id}
                users={allUsers} 
                customRoles={customRoleLabels}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
