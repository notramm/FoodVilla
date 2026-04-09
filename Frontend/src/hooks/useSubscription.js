import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { updateUser } from "../features/auth/authSlice.js";
import { subscriptionService } from "../services/subscription.service.js";
import { PLAN_PRICES, PLAN_LIMITS } from "../utils/constants.js";
import toast from "react-hot-toast";

export const usePlans = () => {
  return useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: subscriptionService.getPlans,
    select: (data) => data.data.plans,
    staleTime: 1000 * 60 * 60, // Cache 1 hour — plans dont change!
  });
};

export const useMySubscription = () => {
  return useQuery({
    queryKey: ["subscription", "my"],
    queryFn: subscriptionService.getMySubscription,
    select: (data) => data.data.subscription,
  });
};

export const useSubscribe = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ planId, planName }) => {
      // Free plan — no payment needed
      if (planName === "free") {
        return await subscriptionService.createOrder(planId);
      }

      // Paid plan — Razorpay flow
      const orderData = await subscriptionService.createOrder(planId);
      const order = orderData.data;

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "GoodFoods",
          description: `${order.plan.displayName} Plan Subscription`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              const result = await subscriptionService.verifyPayment({
                planId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              resolve(result);
            } catch (err) {
              reject(err);
            }
          },
          prefill: {
            name: "Restaurant Owner",
          },
          theme: { color: "#ef4444" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      toast.success(
        variables.planName === "free"
          ? "Downgraded to free plan"
          : `${variables.planName} plan activated! 🎉`
      );
    },
    onError: (error) => {
      if (error.message === "Payment cancelled") {
        toast.error("Payment cancelled");
      } else {
        toast.error(error?.message || "Subscription failed");
      }
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["owner"] });
      toast.success("Subscription cancelled. Downgraded to free plan.");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to cancel subscription");
    },
  });
};