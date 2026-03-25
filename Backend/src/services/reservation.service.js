import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { Reservation } from "../models/Reservation.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { RESERVATION_STATUS } from "../utils/constants.js";
import { getRestaurantById } from "./restaurant.service.js";
import { isDateInPast } from "./datetime.service.js";
import { sendReservationConfirmation, sendCancellationEmail } from "./notification.service.js";

// Generate unique confirmation code like GF-ABC123
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
  // Use transaction — if anything fails, rollback everything!
  // This is very important for production bhai
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const restaurant = await getRestaurantById(restaurantId);

    // Find or create time slot
    let timeSlot = await TimeSlot.findOne({
      restaurant: restaurantId,
      date,
      time,
    }).session(session);

    if (!timeSlot) {
      // Slot doesnt exist yet — create it
      [timeSlot] = await TimeSlot.create(
        [
          {
            restaurant: restaurantId,
            date,
            time,
            totalSeats: restaurant.totalSeats,
            bookedSeats: 0,
            availableSeats: restaurant.totalSeats,
          },
        ],
        { session }
      );
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
    const [reservation] = await Reservation.create(
      [
        {
          user: userId,
          restaurant: restaurantId,
          timeSlot: timeSlot._id,
          date,
          time,
          guests,
          specialRequests,
          confirmationCode,
          status: RESERVATION_STATUS.CONFIRMED,
        },
      ],
      { session }
    );

    // Update time slot — reduce available seats
    await TimeSlot.findByIdAndUpdate(
      timeSlot._id,
      {
        $inc: { bookedSeats: guests, availableSeats: -guests },
      },
      { session }
    );

    await session.commitTransaction();

    // Send confirmation email after successful booking
    await sendReservationConfirmation({
      email: userEmail,
      name: userName,
      restaurantName: restaurant.name,
      date,
      time,
      guests,
      confirmationCode,
    });

    return await Reservation.findById(reservation._id)
      .populate("restaurant", "name address contact")
      .populate("timeSlot", "time date");

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelReservation = async (reservationId, userId, cancelReason) => {
  const reservation = await Reservation.findOne({
    _id: reservationId,
    user: userId,
  }).populate("restaurant", "name");

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update reservation status
    reservation.status = RESERVATION_STATUS.CANCELLED;
    reservation.cancelledAt = new Date();
    reservation.cancelReason = cancelReason || "Cancelled by user";
    await reservation.save({ session });

    // Release seats back to time slot
    await TimeSlot.findByIdAndUpdate(
      reservation.timeSlot,
      {
        $inc: {
          bookedSeats: -reservation.guests,
          availableSeats: reservation.guests,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return reservation;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getUserReservations = async (userId) => {
  return await Reservation.find({ user: userId })
    .populate("restaurant", "name address cuisine images")
    .sort({ createdAt: -1 }); // newest first
};

export const getReservationByCode = async (confirmationCode) => {
  const reservation = await Reservation.findOne({ confirmationCode })
    .populate("restaurant", "name address contact")
    .populate("user", "name email phone");

  if (!reservation) {
    throw new ApiError(404, "Reservation not found");
  }

  return reservation;
};