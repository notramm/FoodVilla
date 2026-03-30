import { CUISINE_TYPES } from "../../utils/constants.js";
import { searchRestaurants } from "../../services/restaurant.service.js";
import { parseNaturalDate } from "../../services/datetime.service.js";

// Definition — what OpenAI sees
export const searchRestaurantsTool = {
  type: "function",
  function: {
    name: "searchRestaurants",
    description: "Search restaurants by cuisine, area, date and guests in Mumbai",
    parameters: {
      type: "object",
      properties: {
        cuisine: {
          type: "string",
          enum: ["Indian", "Italian", "Chinese", "Continental", "Mexican", "Japanese", "Thai", "Mediterranean"],
          description: "Cuisine type",
        },
        area: {
          type: "string",
          description: "Area in Bangalore like Dahisar, Borivali, Mira Road",
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
      required: [],
    },
  },
};

// Execution — actual logic
export const executeSearchRestaurants = async (args) => {
  const { cuisine, area, date, guests } = args;

  // Parse natural language date if provided
  let parsedDate;
  if (date) {
    parsedDate = parseNaturalDate(date);
  }

  const restaurants = await searchRestaurants({
    cuisine,
    area,
    date: parsedDate,
    guests,
  });

  if (restaurants.length === 0) {
    return {
      success: true,
      message: "No restaurants found matching the criteria",
      restaurants: [],
    };
  }

  // Return clean data — dont send everything to AI
  // Less tokens = faster + cheaper!
  return {
    success: true,
    count: restaurants.length,
    restaurants: restaurants.map((r) => ({
      id: r._id,
      name: r.name,
      cuisine: r.cuisine,
      area: r.address.area,
      rating: r.rating,
      averageCostForTwo: r.averageCostForTwo,
      description: r.description,
    })),
  };
};