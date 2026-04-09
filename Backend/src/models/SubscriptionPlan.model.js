import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["free", "premium", "featured"],
    },
    displayName: {
      type: String,
      required: true,
      // "Free", "Premium", "Featured"
    },
    price: {
      type: Number,
      required: true,
      // Monthly price in INR — 0 for free
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    features: [
      {
        type: String,
        // "Basic booking", "AI Marketing", "Analytics" etc
      },
    ],
    limits: {
      restaurants: {
        type: Number,
        default: 1, // Free = 1 restaurant, Premium = unlimited
      },
      imagesPerRestaurant: {
        type: Number,
        default: 3, // Free = 3, Premium = unlimited
      },
      menuItems: {
        type: Number,
        default: 20, // Free = 20, Premium = unlimited
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    razorpayPlanId: {
      type: String,
      default: null, // Razorpay plan ID for recurring billing
    },
  },
  { timestamps: true }
);

export const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);