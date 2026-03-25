import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    date: {
      type: String,
      required: true, // "2024-12-25" stored as string for easy querying
    },
    time: {
      type: String,
      required: true, // "19:00", "19:30" etc
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index — one slot per restaurant per date per time
timeSlotSchema.index(
  { restaurant: 1, date: 1, time: 1 },
  { unique: true }
);

export const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);