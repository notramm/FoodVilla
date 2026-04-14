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
// ✅ Commission imports REMOVED

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

  if (!restaurant.isApproved) {
    throw new ApiError(400, "This restaurant is not accepting reservations yet");
  }

  if (!restaurant.isActive) {
    throw new ApiError(400, "This restaurant is currently unavailable");
  }

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

  if (timeSlot.availableSeats < guests) {
    throw new ApiError(
      400,
      `Only ${timeSlot.availableSeats} seats available for this slot`
    );
  }

  let confirmationCode;
  let isUnique = false;
  while (!isUnique) {
    confirmationCode = generateConfirmationCode();
    const existing = await Reservation.findOne({ confirmationCode });
    if (!existing) isUnique = true;
  }

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

  try {
    await TimeSlot.findByIdAndUpdate(timeSlot._id, {
      $inc: {
        bookedSeats: guests,
        availableSeats: -guests,
      },
    });
  } catch (error) {
    await Reservation.findByIdAndDelete(reservation._id);
    throw new ApiError(500, "Failed to update slot. Please try again.");
  }

  // ✅ Commission creation REMOVED

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
  }

  return await Reservation.findById(reservation._id)
    .populate("restaurant", "name address contact averageCostForTwo images")
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

  // ✅ Commission cancellation REMOVED

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

export const completeReservation = async (reservationId, ownerId) => {
  const reservation = await Reservation.findById(reservationId)
    .populate("restaurant");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  if (reservation.restaurant.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
    throw new ApiError(400, `Cannot complete reservation with status: ${reservation.status}`);
  }

  reservation.status = RESERVATION_STATUS.COMPLETED;
  await reservation.save();

  // ✅ Commission earning REMOVED

  return reservation;
};

export const markNoShow = async (reservationId, ownerId) => {
  const reservation = await Reservation.findById(reservationId)
    .populate("restaurant");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  if (reservation.restaurant.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
    throw new ApiError(400, `Cannot mark no-show for status: ${reservation.status}`);
  }

  reservation.status = RESERVATION_STATUS.NO_SHOW;
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

  return reservation;
};

export const getUserReservations = async (userId) => {
  return await Reservation.find({ user: userId })
    .populate("restaurant", "name address cuisine images averageCostForTwo")
    .sort({ createdAt: -1 });
};

export const getReservationByCode = async (confirmationCode) => {
  const cleanCode = confirmationCode?.trim().toUpperCase();

  const reservation = await Reservation.findOne({
    confirmationCode: cleanCode,
  })
    .populate("restaurant", "name address contact images")
    .populate("user", "name email phone");

  if (!reservation) {
    throw new ApiError(404, `Reservation with code ${cleanCode} not found`);
  }

  return reservation;
};

export const getReservationsByRestaurant = async (restaurantId, filters = {}) => {
  const query = { restaurant: restaurantId };
  if (filters.status) query.status = filters.status;
  if (filters.date) query.date = filters.date;

  return await Reservation.find(query)
    .populate("user", "name email phone")
    .sort({ date: 1, time: 1 });
};

export const getAllReservations = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.date) query.date = filters.date;
  if (filters.restaurantId) query.restaurant = filters.restaurantId;

  return await Reservation.find(query)
    .populate("user", "name email phone")
    .populate({
      path: "restaurant",
      select: "name address owner",
      populate: { path: "owner", select: "name email businessName" },
    })
    .sort({ createdAt: -1 });
};