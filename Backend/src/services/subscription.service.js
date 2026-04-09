import Razorpay from "razorpay";
import { Subscription } from "../models/Subscription.model.js";
import { SubscriptionPlan } from "../models/SubscriptionPlan.model.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

// Get all plans
export const getPlans = async () => {
  return await SubscriptionPlan.find({ isActive: true });
};

// Get owner's current subscription
export const getOwnerSubscription = async (ownerId) => {
  const subscription = await Subscription.findOne({
    owner: ownerId,
    status: "active",
  }).populate("plan");

  return subscription;
};

// Create Razorpay order for subscription payment
export const createSubscriptionOrder = async (ownerId, planId) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  if (plan.name === "free") {
    // Free plan — no payment needed
    return await activateFreePlan(ownerId, plan);
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: plan.price * 100, // Razorpay needs paise
    currency: "INR",
    receipt: `sub_${ownerId}_${Date.now()}`,
    notes: {
      ownerId: ownerId.toString(),
      planId: planId.toString(),
      planName: plan.name,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan: plan,
  };
};

// Verify payment and activate subscription
export const verifyAndActivateSubscription = async ({
  ownerId,
  planId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  // Verify signature
  const crypto = await import("crypto");
  const expectedSignature = crypto
    .default
    .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  // Deactivate old subscription
  await Subscription.updateMany(
    { owner: ownerId, status: "active" },
    { status: "cancelled", cancelledAt: new Date() }
  );

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Create new subscription
  const subscription = await Subscription.create({
    owner: ownerId,
    plan: planId,
    planName: plan.name,
    status: "active",
    razorpaySubscriptionId: razorpayOrderId,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    payments: [
      {
        amount: plan.price,
        paidAt: now,
        razorpayPaymentId,
        status: "success",
      },
    ],
  });

  // Update user plan
  await User.findByIdAndUpdate(ownerId, { currentPlan: plan.name });

  // If featured plan — mark all owner restaurants as featured
  if (plan.name === "featured") {
    await Restaurant.updateMany(
      { owner: ownerId, isApproved: true },
      {
        isFeatured: true,
        featuredUntil: periodEnd,
      }
    );
  }

  return subscription;
};

// Activate free plan
const activateFreePlan = async (ownerId, plan) => {
  await Subscription.updateMany(
    { owner: ownerId, status: "active" },
    { status: "cancelled", cancelledAt: new Date() }
  );

  const subscription = await Subscription.create({
    owner: ownerId,
    plan: plan._id,
    planName: "free",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ), // 1 year for free
  });

  await User.findByIdAndUpdate(ownerId, { currentPlan: "free" });

  // Remove featured if downgraded
  await Restaurant.updateMany(
    { owner: ownerId },
    { isFeatured: false, featuredUntil: null }
  );

  return subscription;
};

// Cancel subscription
export const cancelSubscription = async (ownerId) => {
  const subscription = await Subscription.findOne({
    owner: ownerId,
    status: "active",
  });

  if (!subscription) {
    throw new ApiError(404, "No active subscription found");
  }

  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  await subscription.save();

  // Downgrade to free
  await User.findByIdAndUpdate(ownerId, { currentPlan: "free" });

  // Remove featured
  await Restaurant.updateMany(
    { owner: ownerId },
    { isFeatured: false, featuredUntil: null }
  );

  return subscription;
};

// Check if subscription is expired — run as cron job
export const checkExpiredSubscriptions = async () => {
  const expired = await Subscription.find({
    status: "active",
    currentPeriodEnd: { $lt: new Date() },
    planName: { $ne: "free" },
  });

  for (const sub of expired) {
    sub.status = "expired";
    await sub.save();

    await User.findByIdAndUpdate(sub.owner, { currentPlan: "free" });

    await Restaurant.updateMany(
      { owner: sub.owner },
      { isFeatured: false, featuredUntil: null }
    );

    console.log(`Subscription expired for owner: ${sub.owner}`);
  }
};