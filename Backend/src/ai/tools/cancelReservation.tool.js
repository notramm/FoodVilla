import { cancelReservation, getReservationByCode } from "../../services/reservation.service.js";

export const cancelReservationTool = {
  type: "function",
  function: {
    name: "cancelReservation",
    description: "Cancel a reservation using confirmation code",
    parameters: {
      type: "object",
      properties: {
        confirmationCode: {
          type: "string",
          description: "Confirmation code like GF-ABC123",
        },
        cancelReason: {
          type: "string",
          description: "Reason for cancellation",
        },
      },
      required: ["confirmationCode"],
    },
  },
};

export const executeCancelReservation = async (args, userId) => {
  const { confirmationCode, cancelReason } = args;

  // Find reservation by confirmation code first
  let reservation;
  try {
    reservation = await getReservationByCode(confirmationCode);

  } catch (error) {
    console.log("Reservation not found error:", error.message);
    return {
      success: false,
      error: `No reservation found with code ${confirmationCode}. Please check the code and try again.`,
    };
  }

  // Security check
  if (reservation.user._id.toString() !== userId.toString()) {
    return {
      success: false,
      error: "This reservation does not belong to you",
    };
  }

  try {
    await cancelReservation(
      reservation._id,
      userId,
      cancelReason
    );
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: "Reservation cancelled successfully",
    cancelledReservation: {
      confirmationCode,
      restaurant: reservation.restaurant.name,
      date: reservation.date,
      time: reservation.time,
    },
  };
};