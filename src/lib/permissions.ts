import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// ── Better-Auth AC (unchanged) ────────────────────────────────────────────────

export const statement = {
  ...defaultStatements,
  booking: ["create", "read", "update", "cancel"],
  fleet: ["read", "assign", "update"],
  route: ["read", "update"],
  review: ["create", "read", "moderate"],
  content: ["read", "create", "update"],
  inquiry: ["create", "read", "reply"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
  super_admin: ac.newRole({
    ...adminAc.statements,
    booking: ["create", "read", "update", "cancel"],
    fleet: ["read", "assign", "update"],
    route: ["read", "update"],
    review: ["create", "read", "moderate"],
    content: ["read", "create", "update"],
    inquiry: ["create", "read", "reply"],
  }),
  driver: ac.newRole({
    booking: ["read", "update"],
    fleet: ["read", "assign"],
    route: ["read", "update"],
    review: ["read"],
    content: ["read"],
    inquiry: ["read"],
  }),
  tourist: ac.newRole({
    booking: ["create", "read", "cancel"],
    review: ["create", "read"],
    content: ["read"],
    inquiry: ["create", "read"],
  }),
} as const;

// ── Display labels ────────────────────────────────────────────────────────────

export const roleLabels: Record<keyof typeof roles, string> = {
  super_admin: "Super Admin",
  driver: "Driver",
  tourist: "Tourist",
};

export const roleHighlights: Record<keyof typeof roles, string[]> = {
  super_admin: [
    "Full access to all modules and settings",
    "Manages tours, drivers, roles, fleet and customer requests",
    "Can update content, moderate reviews and oversee all bookings",
  ],
  driver: [
    "Sees assigned routes and transport schedules",
    "Can update trip progress for confirmed bookings",
    "No access to admin-only modules",
  ],
  tourist: [
    "Can create bookings, send inquiries and leave reviews",
    "Gets the public customer experience by default after signup",
    "Read-only access to content",
  ],
};

// ── RBAC: resource × action definitions ──────────────────────────────────────

export const RESOURCE_ACTIONS = {
  booking:      { label: "Bookings",      actions: ["create", "read", "update", "cancel"] },
  tour:         { label: "Tours",         actions: ["create", "read", "update", "delete"] },
  vehicle:      { label: "Vehicles",      actions: ["create", "read", "update", "delete"] },
  driver:       { label: "Drivers",       actions: ["read", "assign", "update"] },
  review:       { label: "Reviews",       actions: ["create", "read", "moderate", "delete"] },
  user:         { label: "Users",         actions: ["read", "update", "ban"] },
  notification: { label: "Notifications", actions: ["create", "read"] },
  report:       { label: "Reports",       actions: ["read", "export"] },
} as const;

export type ResourceKey = keyof typeof RESOURCE_ACTIONS;

// ── Sidebar menu items available for permission assignment ────────────────────

export const MENU_ITEMS = [
  { label: "Overview",           adminOnly: false },
  { label: "Bookings",           adminOnly: false },
  { label: "Tours",              adminOnly: true  },
  { label: "Reviews",            adminOnly: false },
  { label: "Drivers",            adminOnly: true  },
  { label: "Vehicles",           adminOnly: true  },
  { label: "Users",              adminOnly: true  },
  { label: "Roles & Permissions",adminOnly: true  },
  { label: "Live Tracking",      adminOnly: false },
  { label: "Notifications",      adminOnly: false },
  { label: "Appearance",         adminOnly: true  },
  { label: "SEO",                adminOnly: true  },
  { label: "Account",            adminOnly: false },
] as const;

// ── Custom role permission shape ──────────────────────────────────────────────

export interface CustomRolePermissions {
  menus: string[];
  actions: Partial<Record<ResourceKey, string[]>>;
}

/** Parses stored JSON — handles both legacy string[] and new {menus,actions} */
export function parseRolePermissions(raw: string): CustomRolePermissions {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy: just a list of menu strings
      return { menus: parsed, actions: {} };
    }
    return {
      menus: Array.isArray(parsed.menus) ? parsed.menus : [],
      actions: parsed.actions ?? {},
    };
  } catch {
    return { menus: [], actions: {} };
  }
}

export function defaultRoleMenus(roleKey: string): string[] {
  return MENU_ITEMS.filter((item) => {
    if (item.adminOnly && roleKey !== "super_admin") return false;
    if (item.label === "Reviews" && roleKey === "driver") return false;
    return true;
  }).map((item) => item.label);
}

export function defaultRoleActions(roleKey: string): Partial<Record<ResourceKey, string[]>> {
  const r = roles[roleKey as keyof typeof roles];
  if (!r) return {};
  const map: Partial<Record<ResourceKey, string[]>> = {};
  for (const resource of Object.keys(RESOURCE_ACTIONS) as ResourceKey[]) {
    const stmts = (r as any).statements?.[resource];
    if (stmts && stmts.length > 0) map[resource] = [...stmts];
  }
  return map;
}
