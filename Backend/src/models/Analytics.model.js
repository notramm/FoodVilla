import mongoose from "mongoose";

// Daily analytics per restaurant
const analyticsSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: String,
      required: true, // "2024-12-28"
    },

    // Views — how many times restaurant appeared in search
    searchAppearances: {
      type: Number,
      default: 0,
    },

    // How many times detail page was viewed
    profileViews: {
      type: Number,
      default: 0,
    },

    // Bookings made
    bookingsMade: {
      type: Number,
      default: 0,
    },

    // Bookings cancelled
    bookingsCancelled: {
      type: Number,
      default: 0,
    },

    // AI chat mentions
    aiMentions: {
      type: Number,
      default: 0, // How many times AI showed this restaurant
    },
  },
  { timestamps: true }
);

// Compound index — one record per restaurant per day
analyticsSchema.index(
  { restaurant: 1, date: 1 },
  { unique: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);