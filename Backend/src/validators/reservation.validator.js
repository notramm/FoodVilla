import { z } from "zod";

export const createReservationSchema = z.object({
  restaurantId: z
    .string({ required_error: "Restaurant ID is required" })
    .regex(/^[a-f\d]{24}$/i, "Invalid restaurant ID"), // MongoDB ObjectId check

  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "Reservation date cannot be in the past"),

  time: z
    .string({ required_error: "Time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),

  guests: z
    .number({ required_error: "Number of guests is required" })
    .int()
    .min(1, "At least 1 guest required")
    .max(20, "Maximum 20 guests allowed"),

  specialRequests: z
    .string()
    .trim()
    .max(200, "Special requests too long")
    .optional(),
});

export const cancelReservationSchema = z.object({
  cancelReason: z
    .string()
    .trim()
    .max(200)
    .optional(),
});

export const updateReservationSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, "Reservation date cannot be in the past")
    .optional(),

  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
    .optional(),

  guests: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional(),

  specialRequests: z
    .string()
    .trim()
    .max(200)
    .optional(),
});