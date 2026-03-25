import mongoose from "mongoose";
import { RESERVATION_STATUS } from "../utils/constants.js";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
    },
    date: {
      type: String,
      required: true, // "2024-12-25"
    },
    time: {
      type: String,
      required: true, // "19:00"
    },
    guests: {
      type: Number,
      required: true,
      min: [1, "At least 1 guest required"],
      max: [20, "Maximum 20 guests allowed"],
    },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.CONFIRMED,
    },
    specialRequests: {
      type: String,
      trim: true, // "Window seat please", "Birthday celebration"
    },
    confirmationCode: {
      type: String,
      unique: true, // like "GF-2024-XYZABC" shown to user
    },
    cancelledAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
reservationSchema.index({ user: 1 });
reservationSchema.index({ restaurant: 1, date: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ confirmationCode: 1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);