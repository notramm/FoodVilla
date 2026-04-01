import api from "./api.js";

export const authService = {
  register: async (data) => {
    return await api.post("/auth/register", data);
  },

  login: async (data) => {
    return await api.post("/auth/login", data);
  },

  logout: async () => {
    return await api.post("/auth/logout");
  },

  getMe: async () => {
    return await api.get("/auth/me");
  },

  refreshToken: async () => {
    return await api.post("/auth/refresh-token");
  },

  changePassword: async (data) => {
    return await api.patch("/auth/change-password", data);
  },
};