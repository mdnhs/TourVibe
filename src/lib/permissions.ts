import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

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

export const roleLabels: Record<keyof typeof roles, string> = {
  super_admin: "Super Admin",
  driver: "Driver",
  tourist: "Tourist",
};

export const roleHighlights: Record<keyof typeof roles, string[]> = {
  super_admin: [
    "Manages tours, drivers, roles, fleet and customer requests",
    "Can update content, moderate reviews and oversee all bookings",
  ],
  driver: [
    "Sees assigned routes and transport schedules",
    "Can update trip progress for confirmed bookings",
  ],
  tourist: [
    "Can create bookings, send inquiries and leave reviews",
    "Gets the public customer experience by default after signup",
  ],
};
