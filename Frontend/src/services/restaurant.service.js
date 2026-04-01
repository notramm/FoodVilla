import api from "./api.js";

export const restaurantService = {
  getAll: async (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
    return await api.get("/restaurants", { params });
  },

  getById: async (id) => {
    return await api.get(`/restaurants/${id}`);
  },

  getSlots: async (id, date, guests) => {
    return await api.get(`/restaurants/${id}/slots`, {
      params: { date, guests },
    });
  },

  
};