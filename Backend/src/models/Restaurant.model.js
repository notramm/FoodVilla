import mongoose from "mongoose";
import { CUISINE_TYPES } from "../utils/constants.js";

const operatingHoursSchema = new mongoose.Schema(
  {
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

// Table map — physical table layout
const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: {
      type: String,
      enum: ["indoor", "outdoor", "private", "bar"],
      default: "indoor",
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

// Holiday/closure dates
const holidaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2024-12-25"
    reason: { type: String }, // "Christmas"
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cuisine: [
      {
        type: String,
        enum: CUISINE_TYPES,
        required: true,
      },
    ],
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: "Bangalore" },
      pincode: { type: String, required: true },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
      website: { type: String },
    },
    operatingHours: {
      monday: operatingHoursSchema,
      tuesday: operatingHoursSchema,
      wednesday: operatingHoursSchema,
      thursday: operatingHoursSchema,
      friday: operatingHoursSchema,
      saturday: operatingHoursSchema,
      sunday: operatingHoursSchema,
    },

    // ✅ Table Map — replaces totalSeats
    tables: [tableSchema],
    totalSeats: {
      type: Number,
      required: true,
    },

    // ✅ Holiday closures
    holidays: [holidaySchema],

    averageCostForTwo: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    images: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Admin controls
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    isVerified: {
      type: Boolean,
      default: false, // Admin verified — shows verified badge
    },
    isBanned: {
      type: Boolean,
      default: false, // Banned restaurants dont appear anywhere
    },
    banReason: {
      type: String,
      default: null,
    },

    // ✅ Featured placement
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null, // Featured expires when subscription ends
    },

    // ✅ Tags for AI search
    tags: [
      {
        type: String,
        // "romantic", "family", "craft beer", "rooftop", "live music"
      },
    ],

    // ✅ Ambiance info for AI
    ambiance: {
      type: String,
      enum: [
        "casual", "fine_dining", "family", "romantic",
        "business", "rooftop", "outdoor", "cafe",
      ],
      default: "casual",
    },

    amenities: [
      {
        type: String,
        // "wifi", "parking", "live_music", "craft_beer", "valet"
      },
    ],
  },
  { timestamps: true }
);

restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ "address.area": 1 });
restaurantSchema.index({ isActive: 1, isApproved: 1, isBanned: 1 });
restaurantSchema.index({ isFeatured: 1 }); // Fast featured query
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ tags: 1 }); // AI search by tags

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);