import { apiClient } from "./client";

export const authApi = {
  register: (data) =>
    apiClient("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    apiClient("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  googleAuth: (data) =>
    apiClient("/auth/google", { method: "POST", body: JSON.stringify(data) }),
  refresh: () => apiClient("/auth/refresh", { method: "POST" }),
  logout: () => apiClient("/auth/logout", { method: "POST" }),
};

export const usersApi = {
  getMe: () => apiClient("/users/me"),
  updateMe: (data) =>
    apiClient("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  getPublicProfile: (id) => apiClient(`/users/${id}`),
  getMyItems: () => apiClient("/users/me/items"),
};

export const categoriesApi = {
  list: () => apiClient("/categories"),
  getBySlug: (slug) => apiClient(`/categories/${slug}`),
};

export const itemsApi = {
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, val);
      }
    });
    const queryString = searchParams.toString();
    return apiClient(`/items${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id) => apiClient(`/items/${id}`),
};
