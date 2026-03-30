import { getAvailableSlots } from "../../services/restaurant.service.js";
import { parseNaturalDate } from "../../services/datetime.service.js";

export const checkAvailabilityTool = {
  type: "function",
  function: {
    name: "checkAvailability",
    description: "Check available time slots for a restaurant on a date",
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
        guests: {
          type: "number",
          description: "Number of guests",
        },
      },
      required: ["restaurantId", "date", "guests"],
    },
  },
};

export const executeCheckAvailability = async (args) => {
  const { restaurantId, date, guests } = args;

  // Parse natural language date
  const parsedDate = parseNaturalDate(date);

  const availableSlots = await getAvailableSlots(
    restaurantId,
    parsedDate,
    guests
  );

  if (availableSlots.length === 0) {
    return {
      success: true,
      message: `No available slots for ${guests} guests on ${parsedDate}`,
      slots: [],
    };
  }

  return {
    success: true,
    date: parsedDate,
    availableSlots: availableSlots.map((slot) => ({
      time: slot.time,
      availableSeats: slot.availableSeats,
    })),
  };
};