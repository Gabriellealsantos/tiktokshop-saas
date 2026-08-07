import { requestBackend } from "@/utils/requests";
import type { GalleryAvatarForm } from "@/models/galleryAvatar";

export const listAdminGalleryAvatars = () =>
    requestBackend({ method: "GET", url: "/api/admin/avatars/gallery", withCredentials: true });

export const createGalleryAvatar = (body: GalleryAvatarForm) =>
    requestBackend({ method: "POST", url: "/api/admin/avatars/gallery", data: body, withCredentials: true });

export const updateGalleryAvatar = (id: number, body: GalleryAvatarForm) =>
    requestBackend({ method: "PUT", url: `/api/admin/avatars/gallery/${id}`, data: body, withCredentials: true });

export const deleteGalleryAvatar = (id: number) =>
    requestBackend({ method: "DELETE", url: `/api/admin/avatars/gallery/${id}`, withCredentials: true });