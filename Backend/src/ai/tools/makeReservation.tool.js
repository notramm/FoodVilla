import { createReservation } from "../../services/reservation.service.js";
import { parseNaturalDate } from "../../services/datetime.service.js";
import { User } from "../../models/User.model.js";

export const makeReservationTool = {
  type: "function",
  function: {
    name: "makeReservation",
    description: "Book a table at a restaurant after user confirms all details",
    parameters: {
      type: "object",
      properties: {
        restaurantId: {
          type: "string",
          description: "Restaurant ID",
        },
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format",
        },
        time: {
          type: "string",
          description: "Time in HH:MM format like 19:00",
        },
        guests: {
          type: "number",
          description: "Number of guests",
        },
        specialRequests: {
          type: "string",
          description: "Any special requests from user",
        },
      },
      required: ["restaurantId", "date", "time", "guests"],
    },
  },
};

export const executeMakeReservation = async (args, userId) => {
  const { restaurantId, date, time, guests, specialRequests } = args;

  // Parse natural date just in case
  const parsedDate = parseNaturalDate(date);

  // Get user details for email
  const user = await User.findById(userId).select("name email");
  if (!user) {
    return {
      success: false,
      error: "User not found. Please login again.",
    };
  }

  const reservation = await createReservation({
    userId,
    restaurantId,
    date: parsedDate,
    time,
    guests,
    specialRequests,
    userEmail: user.email,
    userName: user.name,
  });

  return {
    success: true,
    message: "Reservation confirmed successfully!",
    reservation: {
      confirmationCode: reservation.confirmationCode,
      restaurant: reservation.restaurant.name,
      address: reservation.restaurant.address,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      status: reservation.status,
      specialRequests: reservation.specialRequests,
    },
  };
};