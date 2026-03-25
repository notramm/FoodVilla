import { Restaurant } from "../models/Restaurant.model.js";
import { TimeSlot } from "../models/TimeSlot.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getDayName, generateTimeSlots, isSlotBookableToday, getTodayIST } from "./datetime.service.js";

export const createRestaurant = async (data, managedBy) => {
  const restaurant = await Restaurant.create({ ...data, managedBy });
  return restaurant;
};

// Search restaurants by cuisine and/or area
export const searchRestaurants = async ({ cuisine, area, date, guests }) => {
  const query = { isActive: true };

  if (cuisine) {
    query.cuisine = { $in: [cuisine] };
  }

  if (area) {
    // Case insensitive search
    query["address.area"] = { $regex: area, $options: "i" };
  }

  let restaurants = await Restaurant.find(query).select("-managedBy");

  // If date and guests provided, filter by availability
  if (date && guests) {
    const availableRestaurants = [];

    for (const restaurant of restaurants) {
      // Check if restaurant is open that day
      const dayName = getDayName(date);
      const hours = restaurant.operatingHours[dayName];

      if (hours?.isClosed) continue;

      // Check if any slot has enough seats
      const slots = await TimeSlot.find({
        restaurant: restaurant._id,
        date,
        availableSeats: { $gte: guests },
        isAvailable: true,
      });

      if (slots.length > 0) {
        availableRestaurants.push(restaurant);
      }
    }

    return availableRestaurants;
  }

  return restaurants;
};

export const getRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    isActive: true,
  });

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

// Get available time slots for a restaurant on a date
export const getAvailableSlots = async (restaurantId, date, guests) => {
  const restaurant = await getRestaurantById(restaurantId);

  // Check if open that day
  const dayName = getDayName(date);
  const hours = restaurant.operatingHours[dayName];

  if (!hours || hours.isClosed) {
    throw new ApiError(400, `Restaurant is closed on ${dayName}`);
  }

  // Generate all possible slots for the day
  const allSlots = generateTimeSlots(hours.open, hours.close);

  // Get existing slot records from DB
  const existingSlots = await TimeSlot.find({ restaurant: restaurantId, date });
  const existingSlotMap = {};
  existingSlots.forEach((s) => (existingSlotMap[s.time] = s));

  const today = getTodayIST();
  const result = [];

  for (const time of allSlots) {
    // Skip past slots for today
    if (date === today && !isSlotBookableToday(date, time)) continue;

    const existing = existingSlotMap[time];

    if (existing) {
      // Slot exists in DB — check availability
      if (existing.availableSeats >= guests && existing.isAvailable) {
        result.push({
          time,
          availableSeats: existing.availableSeats,
        });
      }
    } else {
      // Slot not in DB yet — means fully available
      result.push({
        time,
        availableSeats: restaurant.totalSeats,
      });
    }
  }

  return result;
};