import { requestBackend } from "../utils/requests";
import type { UserResponse, ProfileUpdateRequest, ChangePasswordRequest, UserRequest } from "@/models/user";

// ── Self (usuário logado) ─────────────────────────────────────────────────────
export const findMe = () =>
  requestBackend({ method: "GET", url: "/users/me", withCredentials: true });

export const updateMe = (data: ProfileUpdateRequest) =>
  requestBackend({ method: "PUT", url: "/users/me", data, withCredentials: true });

export const changeMyPassword = (data: ChangePasswordRequest) =>
  requestBackend({ method: "PUT", url: "/users/me/password", data, withCredentials: true });

export const uploadProfilePhoto = (file: File) => {
  const data = new FormData();
  data.append("file", file);
  return requestBackend({
    method: "POST",
    url: "/users/me/photo",
    data,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeProfilePhoto = () =>
  requestBackend({ method: "DELETE", url: "/users/me/photo", withCredentials: true });

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
