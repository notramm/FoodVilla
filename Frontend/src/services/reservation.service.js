import api from "./api.js";

export const reservationService = {
  create: async (data) => {
    return await api.post("/reservations", data);
  },

  getMyReservations: async () => {
    return await api.get("/reservations/my");
  },

  getByCode: async (code) => {
    return await api.get(`/reservations/code/${code}`);
  },

  cancel: async (id, data = {}) => {
    return await api.patch(`/reservations/${id}/cancel`, data);
  },
};