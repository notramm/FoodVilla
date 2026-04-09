import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One active subscription per owner
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    planName: {
      type: String,
      enum: ["free", "premium", "featured"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due"],
      default: "active",
    },

    // Razorpay fields
    razorpaySubscriptionId: {
      type: String,
      default: null,
    },
    razorpayCustomerId: {
      type: String,
      default: null,
    },

    // Billing dates
    currentPeriodStart: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      // 30 days from start by default
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Payment history
    payments: [
      {
        amount: Number,
        paidAt: Date,
        razorpayPaymentId: String,
        status: {
          type: String,
          enum: ["success", "failed"],
        },
      },
    ],
  },
  { timestamps: true }
);

subscriptionSchema.index({ owner: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ planName: 1 });

export const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);