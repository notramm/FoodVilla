import api from "./api.js";

export const chatService = {
  sendMessage: async (message) => {
    return await api.post("/chat", { message });
  },

  getHistory: async () => {
    return await api.get("/chat/history");
  },

  clearChat: async () => {
    return await api.delete("/chat/clear");
  },
};