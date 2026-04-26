"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { createCustomRole, updateCustomRole, updateBuiltinRolePermissions, resetBuiltinRolePermissions } from "./actions";
import {
  MENU_ITEMS,
  RESOURCE_ACTIONS,
  parseRolePermissions,
  defaultRoleMenus,
  defaultRoleActions,
  type CustomRolePermissions,
  type ResourceKey,
} from "@/lib/permissions";

const ACTION_COLORS: Record<string, string> = {
  create: "text-emerald-600",
  read:   "text-sky-600",
  update: "text-amber-600",
  delete: "text-red-500",
  cancel: "text-orange-500",
  ban:    "text-red-600",
  assign: "text-violet-600",
  moderate: "text-purple-600",
  export: "text-teal-600",
  reply:  "text-cyan-600",
};

function ActionBadge({ action }: { action: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide ${ACTION_COLORS[action] ?? "text-muted-foreground"}`}>
      {action}
    </span>
  );
}

interface RoleFormProps {
  initialData?: { id: string; name: string; description: string | null; permissions: string };
  onSuccess?: () => void;
}

export function RoleForm({ initialData, onSuccess }: RoleFormProps) {
  const isEdit = !!initialData;
  const [isPending, startTransition] = useTransition();

  const initial = initialData ? parseRolePermissions(initialData.permissions) : { menus: [], actions: {} as Partial<Record<ResourceKey, string[]>> };

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [selectedMenus, setSelectedMenus] = useState<string[]>(initial.menus);
  const [selectedActions, setSelectedActions] = useState<Partial<Record<ResourceKey, string[]>>>(initial.actions);

  const toggleMenu = (menu: string) => {
    setSelectedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  };

  const toggleAction = (resource: ResourceKey, action: string) => {
    setSelectedActions((prev) => {
      const current = prev[resource] ?? [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  const toggleAllActions = (resource: ResourceKey) => {
    const all = RESOURCE_ACTIONS[resource].actions as readonly string[];
    const current = selectedActions[resource] ?? [];
    const allSelected = all.every((a) => current.includes(a));
    setSelectedActions((prev) => ({ ...prev, [resource]: allSelected ? [] : [...all] }));
  };

  const selectAllMenus = () => setSelectedMenus(MENU_ITEMS.map((m) => m.label));
  const clearAllMenus = () => setSelectedMenus([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Role name is required"); return; }
    if (selectedMenus.length === 0) { toast.error("Select at least one menu permission"); return; }

    const permissions: CustomRolePermissions = {
      menus: selectedMenus,
      actions: Object.fromEntries(
        Object.entries(selectedActions).filter(([, v]) => v && v.length > 0)
      ) as Partial<Record<ResourceKey, string[]>>,
    };

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("permissions", JSON.stringify(permissions));

    startTransition(async () => {
      const result = isEdit
        ? await updateCustomRole(initialData.id, formData)
        : await createCustomRole(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Role updated" : "Role created");
        onSuccess?.();
      }
    });
  };

  const totalActions = Object.values(selectedActions).reduce((s, v) => s + (v?.length ?? 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="role-name">Role Name <span className="text-destructive">*</span></Label>
          <Input
            id="role-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Content Manager"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role-desc">Description</Label>
          <Input
            id="role-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief role purpose…"
          />
        </div>
      </div>

      <Separator />

      {/* Sidebar menu access */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sidebar Access</p>
            <p className="text-xs text-muted-foreground">Which dashboard sections this role can see.</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer text-[10px] h-5 px-1.5" onClick={selectAllMenus}>All</Badge>
            <Badge variant="outline" className="cursor-pointer text-[10px] h-5 px-1.5" onClick={clearAllMenus}>None</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
          {MENU_ITEMS.map((item) => (
            <label
              key={item.label}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <Checkbox
                checked={selectedMenus.includes(item.label)}
                onCheckedChange={() => toggleMenu(item.label)}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.adminOnly && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500">adm</span>
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedMenus.length} of {MENU_ITEMS.length} sections selected
        </p>
      </div>

      <Separator />

      {/* Resource action permissions */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Resource Permissions</p>
          <p className="text-xs text-muted-foreground">
            Fine-grained action control per resource. {totalActions > 0 && <span className="text-primary font-medium">{totalActions} action{totalActions !== 1 ? "s" : ""} granted.</span>}
          </p>
        </div>
        <div className="space-y-2">
          {(Object.entries(RESOURCE_ACTIONS) as [ResourceKey, { label: string; actions: readonly string[] }][]).map(([resource, { label, actions }]) => {
            const current = selectedActions[resource] ?? [];
            const allSelected = actions.every((a) => current.includes(a));
            const someSelected = current.length > 0 && !allSelected;

            return (
              <div key={resource} className="rounded-lg border bg-card">
                {/* Resource header */}
                <div
                  className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  onClick={() => toggleAllActions(resource)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full ${current.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm font-medium">{label}</span>
                    {current.length > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {current.length}/{actions.length}
                      </Badge>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold ${allSelected ? "text-primary" : someSelected ? "text-amber-500" : "text-muted-foreground"}`}>
                    {allSelected ? "All granted" : someSelected ? "Partial" : "No access"}
                  </span>
                </div>

                {/* Action checkboxes */}
                <div className="flex flex-wrap gap-3 border-t px-4 py-3 bg-muted/20">
                  {actions.map((action) => (
                    <label key={action} className="flex cursor-pointer items-center gap-1.5">
                      <Checkbox
                        checked={current.includes(action)}
                        onCheckedChange={() => toggleAction(resource, action)}
                      />
                      <ActionBadge action={action} />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save Changes" : "Create Role")}
        </Button>
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// ── Built-in role permissions editor (driver / tourist only) ─────────────────

interface BuiltinRoleFormProps {
  roleKey: string;
  roleLabel: string;
  /** Existing DB override, or null to show defaults */
  override: CustomRolePermissions | null;
  onSuccess?: () => void;
}

export function BuiltinRoleForm({ roleKey, roleLabel, override, onSuccess }: BuiltinRoleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isResetting, startResetTransition] = useTransition();

  const defaultMenus = defaultRoleMenus(roleKey);
  const defaultActions = defaultRoleActions(roleKey);

  const [selectedMenus, setSelectedMenus] = useState<string[]>(
    override ? override.menus : defaultMenus
  );
  const [selectedActions, setSelectedActions] = useState<Partial<Record<ResourceKey, string[]>>>(
    override ? override.actions : defaultActions
  );

  const toggleMenu = (menu: string) =>
    setSelectedMenus((p) => p.includes(menu) ? p.filter((m) => m !== menu) : [...p, menu]);

  const toggleAction = (resource: ResourceKey, action: string) =>
    setSelectedActions((p) => {
      const curr = p[resource] ?? [];
      return { ...p, [resource]: curr.includes(action) ? curr.filter((a) => a !== action) : [...curr, action] };
    });

  const toggleAllActions = (resource: ResourceKey) => {
    const all = RESOURCE_ACTIONS[resource].actions as readonly string[];
    const curr = selectedActions[resource] ?? [];
    const allSel = all.every((a) => curr.includes(a));
    setSelectedActions((p) => ({ ...p, [resource]: allSel ? [] : [...all] }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedMenus.length === 0) { toast.error("Select at least one menu permission"); return; }

    const permissions: CustomRolePermissions = {
      menus: selectedMenus,
      actions: Object.fromEntries(
        Object.entries(selectedActions).filter(([, v]) => v && v.length > 0)
      ) as Partial<Record<ResourceKey, string[]>>,
    };

    const formData = new FormData();
    formData.set("permissions", JSON.stringify(permissions));

    startTransition(async () => {
      const result = await updateBuiltinRolePermissions(roleKey, formData);
      if (result.error) toast.error(result.error);
      else { toast.success(`${roleLabel} permissions updated`); onSuccess?.(); }
    });
  };

  const handleReset = () => {
    startResetTransition(async () => {
      const result = await resetBuiltinRolePermissions(roleKey);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`${roleLabel} permissions reset to defaults`);
        setSelectedMenus(defaultMenus);
        setSelectedActions(defaultActions);
        onSuccess?.();
      }
    });
  };

  const totalActions = Object.values(selectedActions).reduce((s, v) => s + (v?.length ?? 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Locked role name indicator */}
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
        <div className="size-2 rounded-full bg-amber-500" />
        <span className="text-sm font-semibold">{roleLabel}</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Built-in · name locked
        </span>
      </div>

      <Separator />

      {/* Sidebar menu access */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sidebar Access</p>
            <p className="text-xs text-muted-foreground">Which dashboard sections this role can see.</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer text-[10px] h-5 px-1.5"
              onClick={() => setSelectedMenus(MENU_ITEMS.map((m) => m.label))}>All</Badge>
            <Badge variant="outline" className="cursor-pointer text-[10px] h-5 px-1.5"
              onClick={() => setSelectedMenus([])}>None</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
          {MENU_ITEMS.map((item) => (
            <label key={item.label} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted">
              <Checkbox checked={selectedMenus.includes(item.label)} onCheckedChange={() => toggleMenu(item.label)} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.adminOnly && <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500">adm</span>}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{selectedMenus.length} of {MENU_ITEMS.length} sections selected</p>
      </div>

      <Separator />

      {/* Resource action permissions */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Resource Permissions</p>
          <p className="text-xs text-muted-foreground">
            Fine-grained action control per resource.{" "}
            {totalActions > 0 && <span className="text-primary font-medium">{totalActions} action{totalActions !== 1 ? "s" : ""} granted.</span>}
          </p>
        </div>
        <div className="space-y-2">
          {(Object.entries(RESOURCE_ACTIONS) as [ResourceKey, { label: string; actions: readonly string[] }][]).map(([resource, { label, actions }]) => {
            const curr = selectedActions[resource] ?? [];
            const allSel = actions.every((a) => curr.includes(a));
            const someSel = curr.length > 0 && !allSel;
            return (
              <div key={resource} className="rounded-lg border bg-card">
                <div className="flex cursor-pointer items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors" onClick={() => toggleAllActions(resource)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full ${curr.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm font-medium">{label}</span>
                    {curr.length > 0 && <Badge variant="secondary" className="text-[10px] h-4 px-1">{curr.length}/{actions.length}</Badge>}
                  </div>
                  <span className={`text-[10px] font-semibold ${allSel ? "text-primary" : someSel ? "text-amber-500" : "text-muted-foreground"}`}>
                    {allSel ? "All granted" : someSel ? "Partial" : "No access"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 border-t px-4 py-3 bg-muted/20">
                  {actions.map((action) => (
                    <label key={action} className="flex cursor-pointer items-center gap-1.5">
                      <Checkbox checked={curr.includes(action)} onCheckedChange={() => toggleAction(resource, action)} />
                      <ActionBadge action={action} />
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Saving…" : "Save Permissions"}
        </Button>
        {override && (
          <Button type="button" variant="outline" disabled={isResetting} onClick={handleReset}>
            {isResetting ? "Resetting…" : "Reset to Default"}
          </Button>
        )}
        {onSuccess && (
          <Button type="button" variant="ghost" onClick={onSuccess}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
