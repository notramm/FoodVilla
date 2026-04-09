import api from "./api.js";

export const subscriptionService = {
  // Get all plans
  getPlans: async () => {
    return await api.get("/subscription/plans");
  },

  // Get my subscription
  getMySubscription: async () => {
    return await api.get("/subscription/my");
  },

  // Create Razorpay order
  createOrder: async (planId) => {
    return await api.post("/subscription/order", { planId });
  },

  // Verify payment
  verifyPayment: async (data) => {
    return await api.post("/subscription/verify", data);
  },

  // Cancel subscription
  cancel: async () => {
    return await api.post("/subscription/cancel");
  },
};