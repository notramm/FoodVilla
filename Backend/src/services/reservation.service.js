import { nanoid } from "nanoid";
import { Reservation } from "../models/Reservation.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { ApiError } from "../utils/ApiError.js";
import { RESERVATION_STATUS } from "../utils/constants.js";
import { getRestaurantById } from "./restaurant.service.js";
import { isDateInPast } from "./datetime.service.js";
import {
  sendReservationConfirmation,
  sendCancellationEmail,
} from "./notification.service.js";

const generateConfirmationCode = () => {
  return `GF-${nanoid(6).toUpperCase()}`;
};

export const createReservation = async ({
  userId,
  restaurantId,
  date,
  time,
  guests,
  specialRequests,
  userEmail,
  userName,
}) => {
  const restaurant = await getRestaurantById(restaurantId);

  // Find or create time slot
  let timeSlot = await TimeSlot.findOne({
    restaurant: restaurantId,
    date,
    time,
  });

  if (!timeSlot) {
    timeSlot = await TimeSlot.create({
      restaurant: restaurantId,
      date,
      time,
      totalSeats: restaurant.totalSeats,
      bookedSeats: 0,
      availableSeats: restaurant.totalSeats,
    });
  }

  // Check availability
  if (timeSlot.availableSeats < guests) {
    throw new ApiError(
      400,
      `Only ${timeSlot.availableSeats} seats available for this slot`
    );
  }

  // Generate unique confirmation code
  let confirmationCode;
  let isUnique = false;
  while (!isUnique) {
    confirmationCode = generateConfirmationCode();
    const existing = await Reservation.findOne({ confirmationCode });
    if (!existing) isUnique = true;
  }

  // Create reservation
  let reservation;
  try {
    reservation = await Reservation.create({
      user: userId,
      restaurant: restaurantId,
      timeSlot: timeSlot._id,
      date,
      time,
      guests,
      specialRequests,
      confirmationCode,
      status: RESERVATION_STATUS.CONFIRMED,
    });
  } catch (error) {
    throw new ApiError(500, "Failed to create reservation. Please try again.");
  }

  // Update time slot seats
  try {
    await TimeSlot.findByIdAndUpdate(timeSlot._id, {
      $inc: {
        bookedSeats: guests,
        availableSeats: -guests,
      },
    });
  } catch (error) {
    // Slot update failed — rollback reservation manually!
    await Reservation.findByIdAndDelete(reservation._id);
    throw new ApiError(500, "Failed to update slot. Please try again.");
  }

  // Send confirmation email — dont throw if email fails!
  // Booking is already done — email failure shouldnt cancel it
  try {
    await sendReservationConfirmation({
      email: userEmail,
      name: userName,
      restaurantName: restaurant.name,
      date,
      time,
      guests,
      confirmationCode,
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError.message);
    // Continue — dont throw!
  }

  return await Reservation.findById(reservation._id)
    .populate("restaurant", "name address contact")
    .populate("timeSlot", "time date");
};

export const cancelReservation = async (reservationId, userId, cancelReason) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    user: userId,
  })
    .populate("restaurant", "name")
    .populate("user", "name email");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  if (reservation.status === RESERVATION_STATUS.CANCELLED) {
    throw new ApiError(400, "Reservation is already cancelled");
  }

  if (reservation.status === RESERVATION_STATUS.COMPLETED) {
    throw new ApiError(400, "Cannot cancel a completed reservation");
  }

  if (isDateInPast(reservation.date)) {
    throw new ApiError(400, "Cannot cancel a past reservation");
  }

  reservation.status = RESERVATION_STATUS.CANCELLED;
  reservation.cancelledAt = new Date();
  reservation.cancelReason = cancelReason || "Cancelled by user";
  await reservation.save();

  try {
    await TimeSlot.findByIdAndUpdate(reservation.timeSlot, {
      $inc: {
        bookedSeats: -reservation.guests,
        availableSeats: reservation.guests,
      },
    });
  } catch (error) {
    console.error("Failed to release seats:", error.message);
  }

  try {
    await sendCancellationEmail({
      email: reservation.user?.email,
      name: reservation.user?.name,
      restaurantName: reservation.restaurant.name,
      date: reservation.date,
      time: reservation.time,
      confirmationCode: reservation.confirmationCode,
    });
  } catch (emailError) {
    console.error("Cancellation email failed:", emailError.message);
  }

  return reservation;
};

export const getUserReservations = async (userId) => {
  return await Reservation.find({ user: userId })
    .populate("restaurant", "name address cuisine images")
    .sort({ createdAt: -1 });
};

export const getReservationByCode = async (confirmationCode) => {
  const cleanCode = confirmationCode?.trim().toUpperCase();

  const reservation = await Reservation.findOne({
    confirmationCode: cleanCode,
  })
    .populate("restaurant", "name address contact")
    .populate("user", "name email phone");

  if (!reservation) {
    throw new ApiError(404, `Reservation with code ${cleanCode} not found`);
  }

  return reservation;
};