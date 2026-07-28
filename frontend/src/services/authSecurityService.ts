import { requestBackend } from "../utils/requests";

export interface AuthSecuritySettings {
  singleSessionEnforced: boolean;
}

export const getAuthSecuritySettings = () =>
  requestBackend({ method: "GET", url: "/api/admin/auth-security", withCredentials: true });

export const updateAuthSecuritySettings = (data: AuthSecuritySettings) =>
  requestBackend({ method: "PUT", url: "/api/admin/auth-security", data, withCredentials: true });