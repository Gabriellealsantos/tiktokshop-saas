import { requestBackend } from "../utils/requests";
import type { UserResponse } from "../models/user";

// Página do Spring Data (Page<T>) devolvida pela listagem admin.
export type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type ProfileUpdateRequest = {
  name: string;
  phoneNumber?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UserRequest = {
  name: string;
  email: string;
  phoneNumber?: string;
  cpf?: string;
  password?: string;
  roles?: { id: number }[];
};

// ── Self (usuário logado) ─────────────────────────────────────────────────────
export const findMe = () =>
  requestBackend({ method: "GET", url: "/users/me", withCredentials: true });

export const updateMe = (data: ProfileUpdateRequest) =>
  requestBackend({ method: "PUT", url: "/users/me", data, withCredentials: true });

export const changeMyPassword = (data: ChangePasswordRequest) =>
  requestBackend({ method: "PUT", url: "/users/me/password", data, withCredentials: true });

// ── Admin ─────────────────────────────────────────────────────────────────────
export const findAllUsers = (params?: { page?: number; size?: number }) =>
  requestBackend({
    method: "GET",
    url: "/users",
    params,
    withCredentials: true,
  });

export const findUserById = (id: string) =>
  requestBackend({ method: "GET", url: `/users/${id}`, withCredentials: true });

export const createUser = (data: UserRequest) =>
  requestBackend({ method: "POST", url: "/users", data, withCredentials: true });

export const updateUser = (id: string, data: Partial<UserResponse> & UserRequest) =>
  requestBackend({ method: "PUT", url: `/users/${id}`, data, withCredentials: true });

export const deleteUser = (id: string) =>
  requestBackend({ method: "DELETE", url: `/users/${id}`, withCredentials: true });
