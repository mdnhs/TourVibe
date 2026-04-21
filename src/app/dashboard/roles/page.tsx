import { redirect } from "next/navigation";
import { ShieldCheck, Plus, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import { roleLabels, roleHighlights } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateRoleForm } from "./role-forms";
import { db } from "@/lib/db";
import { deleteCustomRole } from "./actions";

const ALL_MENU_ITEMS = [
  { label: "Overview", adminOnly: false },
  { label: "Bookings", adminOnly: false },
  { label: "Tours", adminOnly: true },
  { label: "Reviews", adminOnly: false },
  { label: "Drivers", adminOnly: true },
  { label: "Vehicles", adminOnly: true },
  { label: "Users", adminOnly: true },
  { label: "Roles & Permissions", adminOnly: true },
  { label: "Live Tracking", adminOnly: false },
  { label: "Notifications", adminOnly: false },
  { label: "Appearance", adminOnly: true },
  { label: "Account", adminOnly: false },
];

function getDefaultRoleMenus(roleKey: string) {
  return ALL_MENU_ITEMS.filter((item) => {
    if (item.adminOnly && roleKey !== "super_admin") return false;
    if (item.label === "Reviews" && roleKey === "driver") return false;
    return true;
  }).map(item => item.label);
}

export default async function RolesPage() {
  const { isSuperAdmin } = await requireDashboardSession();

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  const customRoles = db.prepare("SELECT * FROM custom_role ORDER BY createdAt DESC").all() as {
    id: string;
    name: string;
    description: string;
    permissions: string;
  }[];

  return (
    <>
      <SiteHeader title="Roles & Permissions" subtitle="System access control" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
            <p className="text-muted-foreground">
              Overview of available system roles and their assigned permissions.
            </p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Role
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Custom Role</DialogTitle>
                <DialogDescription>
                  Define a new role with specific sidebar menu access.
                </DialogDescription>
              </DialogHeader>
              <CreateRoleForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Default Roles
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(roleLabels).map(([key, label]) => {
                const menuList = getDefaultRoleMenus(key);
                return (
                  <Card key={key} className="shadow-xs border-border flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ShieldCheck className="size-5 text-primary" />
                          {label}
                        </CardTitle>
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                          {key}
                        </Badge>
                      </div>
                      <CardDescription>
                        System default role with core permissions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Functional highlights
                        </p>
                        <div className="space-y-1.5">
                          {roleHighlights[key as keyof typeof roleHighlights].map((highlight) => (
                            <div
                              key={highlight}
                              className="text-xs text-muted-foreground leading-normal flex items-start gap-1.5"
                            >
                              <div className="mt-1.5 size-1 rounded-full bg-primary/40 shrink-0" />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Menu Permissions
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {menuList.map((menu) => (
                            <Badge key={menu} variant="outline" className="font-normal text-[10px] py-0 h-5 px-1.5 bg-muted/20">
                              {menu}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {customRoles.length > 0 && (
            <section>
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Custom Roles
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customRoles.map((role) => {
                  const permissions = JSON.parse(role.permissions) as string[];
                  return (
                    <Card key={role.id} className="shadow-xs border-border flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-500" />
                            {role.name}
                          </CardTitle>
                          <form action={async () => {
                            "use server";
                            await deleteCustomRole(role.id);
                          }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                        <CardDescription>
                          {role.description || "No description provided."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Menu Permissions
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {permissions.map((p) => (
                            <Badge key={p} variant="outline" className="font-normal text-[10px] py-0 h-5 px-1.5 bg-amber-50/30 text-amber-700 border-amber-200/50">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
