import { getAccessTokenPayload } from "./token";

// Roles do back (RoleConstants.java).
export type Role = "ROLE_ADMIN" | "ROLE_AFFILIATE" | "ROLE_CLIENT";

export function getRoles(): string[] {
  return getAccessTokenPayload()?.authorities ?? [];
}

export function hasAnyRoles(roles: Role[]): boolean {
  if (roles.length === 0) return true;
  const userRoles = getRoles();
  return roles.some((r) => userRoles.includes(r));
}

export const isAdmin = () => hasAnyRoles(["ROLE_ADMIN"]);

// Mapeamento das authorities do back para os rótulos usados hoje nas telas do front.
export type FrontRole = "admin" | "afiliado" | "user";

export function toFrontRole(authorities: string[] = getRoles()): FrontRole {
  if (authorities.includes("ROLE_ADMIN")) return "admin";
  if (authorities.includes("ROLE_AFFILIATE")) return "afiliado";
  return "user";
}
