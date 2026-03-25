import mongoose from "mongoose";
import { CUISINE_TYPES } from "../utils/constants.js";

const operatingHoursSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      required: true, // "09:00"
    },
    close: {
      type: String,
      required: true, // "22:00"
    },
    isClosed: {
      type: Boolean,
      default: false, // for holidays or weekly off
    },
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
      area: { type: String, required: true },   // Koramangala, Indiranagar etc
      city: { type: String, default: "Bangalore" },
      pincode: { type: String, required: true },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String },
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
    totalSeats: {
      type: Number,
      required: true,
    },
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
    images: [
      {
        type: String, // image URLs
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // soft delete — never hard delete restaurants!
    },
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // staff/admin user
    },
  },
  { timestamps: true }
);

// Index for faster search by cuisine and area
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ "address.area": 1 });
restaurantSchema.index({ isActive: 1 });

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);