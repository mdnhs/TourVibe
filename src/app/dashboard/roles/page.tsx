import { redirect } from "next/navigation";
import { ShieldCheck, ShieldPlus, Users, Lock, Pencil, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDashboardSession } from "@/lib/dashboard";
import {
  roleLabels,
  roleHighlights,
  defaultRoleMenus,
  defaultRoleActions,
  RESOURCE_ACTIONS,
  parseRolePermissions,
  type ResourceKey,
} from "@/lib/permissions";
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
import { RoleForm, BuiltinRoleForm } from "./role-forms";
import { db } from "@/lib/db";
import { deleteCustomRole, getRoleUserCounts } from "./actions";
import type { CustomRolePermissions } from "@/lib/permissions";

// ── Static default role capabilities ─────────────────────────────────────────

const DEFAULT_ROLE_COLORS: Record<string, string> = {
  super_admin: "text-primary border-primary/30 bg-primary/5",
  driver:      "text-amber-600 border-amber-200 bg-amber-50",
  tourist:     "text-emerald-600 border-emerald-200 bg-emerald-50",
};

const DEFAULT_ROLE_DOT: Record<string, string> = {
  super_admin: "bg-primary",
  driver:      "bg-amber-500",
  tourist:     "bg-emerald-500",
};

function ActionPill({ action }: { action: string }) {
  const colors: Record<string, string> = {
    create:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    read:     "bg-sky-50 text-sky-700 border-sky-200",
    update:   "bg-amber-50 text-amber-700 border-amber-200",
    delete:   "bg-red-50 text-red-600 border-red-200",
    cancel:   "bg-orange-50 text-orange-700 border-orange-200",
    moderate: "bg-purple-50 text-purple-700 border-purple-200",
    ban:      "bg-red-50 text-red-700 border-red-200",
    assign:   "bg-violet-50 text-violet-700 border-violet-200",
    export:   "bg-teal-50 text-teal-700 border-teal-200",
    reply:    "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide ${colors[action] ?? "bg-muted text-muted-foreground border-border"}`}>
      {action}
    </span>
  );
}

function PermissionMatrix({ actions }: { actions: Partial<Record<ResourceKey, string[]>> }) {
  const entries = Object.entries(RESOURCE_ACTIONS) as [ResourceKey, { label: string; actions: readonly string[] }][];
  const active = entries.filter(([k]) => (actions[k]?.length ?? 0) > 0);
  if (active.length === 0) return <p className="text-xs text-muted-foreground italic">No resource permissions</p>;
  return (
    <div className="space-y-1.5">
      {active.map(([resource, { label }]) => (
        <div key={resource} className="flex items-start gap-2">
          <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground w-20 shrink-0">{label}</span>
          <div className="flex flex-wrap gap-1">
            {(actions[resource] ?? []).map((a) => <ActionPill key={a} action={a} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function RolesPage() {
  const { isSuperAdmin } = await requireDashboardSession();
  if (!isSuperAdmin) redirect("/dashboard");

  const customRoles = await db.customRole.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const userCounts = await getRoleUserCounts();

  // Load any admin overrides for driver + tourist
  async function readOverride(roleKey: string): Promise<CustomRolePermissions | null> {
    const row = await db.settings.findUnique({
      where: { key: `role_override_${roleKey}` }
    });
    if (!row) return null;
    try { return parseRolePermissions(row.value); } catch { return null; }
  }
  const builtinOverrides: Record<string, CustomRolePermissions | null> = {
    driver:  await readOverride("driver"),
    tourist: await readOverride("tourist"),
  };

  return (
    <>
      <SiteHeader title="Roles & Permissions" subtitle="RBAC access control" />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-6 p-4 md:p-6">

        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
            <p className="text-sm text-muted-foreground max-w-lg">
              Three built-in roles ship with fixed permissions. Create custom roles with
              fine-grained sidebar and resource-action control.
            </p>
          </div>

          <Dialog>
            <DialogTrigger render={
              <Button className="shrink-0">
                <ShieldPlus className="mr-2 size-4" />
                New Role
              </Button>
            } />
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Role</DialogTitle>
                <DialogDescription>
                  Define sidebar access and fine-grained resource permissions.
                </DialogDescription>
              </DialogHeader>
              <RoleForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-2xl">
          {[
            { label: "Super Admins", key: "super_admin", color: "text-primary" },
            { label: "Drivers",      key: "driver",      color: "text-amber-600" },
            { label: "Tourists",     key: "tourist",     color: "text-emerald-600" },
            { label: "Custom Roles", key: "_custom",     color: "text-violet-600" },
          ].map(({ label, key, color }) => (
            <div key={key} className="rounded-xl border bg-card p-3 space-y-0.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>
                {key === "_custom" ? customRoles.length : (userCounts[key] ?? 0)}
              </p>
            </div>
          ))}
        </div>

        {/* ── Default Roles ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Built-in Roles
            </h3>
            <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(Object.entries(roleLabels) as [keyof typeof roleLabels, string][]).map(([key, label]) => {
              const isEditable = key === "driver" || key === "tourist";
              const override = isEditable ? builtinOverrides[key] : null;
              const menus = override ? override.menus : defaultRoleMenus(key);
              const actions = override ? override.actions : defaultRoleActions(key);
              const count = userCounts[key] ?? 0;

              return (
                <Card key={key} className={`border ${DEFAULT_ROLE_COLORS[key] ?? ""} flex flex-col`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`size-2 rounded-full shrink-0 ${DEFAULT_ROLE_DOT[key] ?? "bg-muted-foreground"}`} />
                        <CardTitle className="text-base">{label}</CardTitle>
                        {override && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-amber-300 bg-amber-50 text-amber-700 shrink-0">
                            customized
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Users className="size-3 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">{count}</span>
                        {isEditable && (
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="icon" className="size-7 ml-1">
                                <Pencil className="size-3.5" />
                              </Button>
                            } />
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit {label} Permissions</DialogTitle>
                                <DialogDescription>
                                  Customize which sidebar sections and resource actions the {label} role can access.
                                  The role name cannot be changed.
                                </DialogDescription>
                              </DialogHeader>
                              <BuiltinRoleForm
                                roleKey={key}
                                roleLabel={label}
                                override={override}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    <CardDescription className="font-mono text-[10px] uppercase tracking-wider">
                      {key} · {isEditable ? "editable" : "read-only"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 text-sm">
                    <ul className="space-y-1">
                      {roleHighlights[key].map((h) => (
                        <li key={h} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <div className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-50" />
                          {h}
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-1.5 pt-2 border-t">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Sidebar Access
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {menus.map((m) => (
                          <Badge key={m} variant="outline" className="text-[10px] py-0 h-5 px-1.5">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t pt-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Resource Permissions
                      </p>
                      <PermissionMatrix actions={actions} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── Custom Roles ── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Custom Roles
            </h3>
            {customRoles.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{customRoles.length}</Badge>
            )}
          </div>

          {customRoles.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
              <ShieldPlus className="mx-auto size-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No custom roles yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a custom role to grant specific users tailored access.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customRoles.map((role) => {
                const perms = parseRolePermissions(role.permissions);
                const count = userCounts[role.name] ?? 0;

                return (
                  <Card key={role.id} className="flex flex-col border-violet-200/60">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-2 rounded-full bg-violet-500 shrink-0" />
                          <CardTitle className="text-base truncate">{role.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center gap-1 text-muted-foreground mr-1">
                            <Users className="size-3" />
                            <span className="text-xs font-semibold">{count}</span>
                          </div>

                          {/* Edit */}
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="icon" className="size-7">
                                <Pencil className="size-3.5" />
                              </Button>
                            } />
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Role — {role.name}</DialogTitle>
                                <DialogDescription>
                                  Update permissions for this role. Users with this role are affected immediately.
                                </DialogDescription>
                              </DialogHeader>
                              <RoleForm initialData={role} />
                            </DialogContent>
                          </Dialog>

                          {/* Delete */}
                          <form action={async () => {
                            "use server";
                            await deleteCustomRole(role.id);
                          }}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                              type="submit"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </form>
                        </div>
                      </div>
                      {role.description && (
                        <CardDescription className="text-xs mt-1">{role.description}</CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1 space-y-4 text-sm">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Sidebar Access
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {perms.menus.length > 0
                            ? perms.menus.map((m) => (
                                <Badge key={m} variant="outline" className="text-[10px] py-0 h-5 px-1.5 bg-violet-50/50 text-violet-700 border-violet-200/60">
                                  {m}
                                </Badge>
                              ))
                            : <span className="text-xs text-muted-foreground italic">No menus</span>
                          }
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Resource Permissions
                        </p>
                        <PermissionMatrix actions={perms.actions} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
