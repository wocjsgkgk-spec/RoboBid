import { UserRole } from "@/types";

export type Permission =
  | "opportunities:read"
  | "opportunities:write"
  | "opportunities:delete"
  | "decisions:make"
  | "proposals:read"
  | "proposals:write"
  | "review:technical"
  | "review:business"
  | "settings:manage"
  | "providers:manage"
  | "vault:read"
  | "vault:write"
  | "audit:read";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "opportunities:read",
    "opportunities:write",
    "opportunities:delete",
    "decisions:make",
    "proposals:read",
    "proposals:write",
    "review:technical",
    "review:business",
    "settings:manage",
    "providers:manage",
    "vault:read",
    "vault:write",
    "audit:read",
  ],
  BID_MANAGER: [
    "opportunities:read",
    "opportunities:write",
    "decisions:make",
    "proposals:read",
    "proposals:write",
    "review:technical",
    "review:business",
    "vault:read",
    "vault:write",
    "audit:read",
  ],
  TECH_REVIEWER: [
    "opportunities:read",
    "proposals:read",
    "review:technical",
    "vault:read",
  ],
  BUSINESS_REVIEWER: [
    "opportunities:read",
    "proposals:read",
    "review:business",
    "vault:read",
  ],
  VIEWER: [
    "opportunities:read",
    "proposals:read",
    "vault:read",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canMakeDecision(role: UserRole | undefined): boolean {
  return hasPermission(role, "decisions:make");
}

export function canManageSettings(role: UserRole | undefined): boolean {
  return hasPermission(role, "settings:manage");
}
