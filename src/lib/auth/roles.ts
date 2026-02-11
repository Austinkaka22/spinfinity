export const APP_ROLES = ["admin", "staff", "driver"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/admin",
  staff: "/staff",
  driver: "/driver",
};

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  if (APP_ROLES.includes(value as AppRole)) return value as AppRole;
  return null;
}

export function getRoleHome(role: AppRole | null): string | null {
  if (!role) return null;
  return ROLE_HOME[role];
}
