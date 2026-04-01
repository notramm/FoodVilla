import api from "./api.js";

export const menuService = {
  // Get full menu — grouped by category
  getByRestaurant: async (restaurantId, params = {}) => {
    return await api.get(`/restaurants/${restaurantId}/menu`, { params });
  },

  // Get grouped menu — { "Starters": [...], "Main Course": [...] }
  getGrouped: async (restaurantId) => {
    return await api.get(`/restaurants/${restaurantId}/menu`, {
      params: { grouped: true },
    });
  },

  // Add menu — admin only
  createMenu: async (restaurantId, items) => {
    return await api.post(`/restaurants/${restaurantId}/menu`, { items });
  },

  // Add items to existing menu — admin/staff only
  addItems: async (restaurantId, items) => {
    return await api.post(`/restaurants/${restaurantId}/menu/items`, { items });
  },

  // Update specific item
  updateItem: async (restaurantId, itemId, data) => {
    return await api.patch(
      `/restaurants/${restaurantId}/menu/items/${itemId}`,
      data
    );
  },

  // Toggle item availability
  toggleAvailability: async (restaurantId, itemId) => {
    return await api.patch(
      `/restaurants/${restaurantId}/menu/items/${itemId}/toggle`
    );
  },

  // Delete item
  deleteItem: async (restaurantId, itemId) => {
    return await api.delete(
      `/restaurants/${restaurantId}/menu/items/${itemId}`
    );
  },
};