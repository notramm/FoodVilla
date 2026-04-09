import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  getPlans,
  getOwnerSubscription,
  createSubscriptionOrder,
  verifyAndActivateSubscription,
  cancelSubscription,
} from "../services/subscription.service.js";

const router = Router();

// ✅ Public — anyone can see plans
router.get("/plans", asyncHandler(async (req, res) => {
  const plans = await getPlans();
  return res
    .status(200)
    .json(new ApiResponse(200, { plans }, "Plans fetched"));
}));

// ✅ Protected — owner only
router.use(verifyJWT);
router.use(authorizeRoles(USER_ROLES.OWNER, USER_ROLES.ADMIN));

// Get my subscription
router.get("/my", asyncHandler(async (req, res) => {
  const subscription = await getOwnerSubscription(req.user._id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscription }, "Subscription fetched")
    );
}));

// Create order to upgrade plan
router.post("/order", asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const order = await createSubscriptionOrder(req.user._id, planId);
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order created"));
}));

// Verify payment and activate
router.post("/verify", asyncHandler(async (req, res) => {
  const {
    planId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const subscription = await verifyAndActivateSubscription({
    ownerId: req.user._id,
    planId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscription, "Subscription activated! 🎉")
    );
}));

// Cancel subscription
router.post("/cancel", asyncHandler(async (req, res) => {
  const subscription = await cancelSubscription(req.user._id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscription, "Subscription cancelled")
    );
}));

export default router;