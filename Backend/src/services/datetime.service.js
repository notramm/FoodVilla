import { ApiError } from "../utils/ApiError.js";

// Bangalore is IST = UTC+5:30
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// Get current date/time in IST
export const getNowIST = () => {
  return new Date(Date.now() + IST_OFFSET);
};

// Get today's date string in YYYY-MM-DD in IST
export const getTodayIST = () => {
  return getNowIST().toISOString().split("T")[0];
};

// Convert any date string to IST Date object
export const toIST = (dateString) => {
  const date = new Date(dateString);
  return new Date(date.getTime() + IST_OFFSET);
};

// Get day name from date string
// "2024-12-25" → "wednesday"
export const getDayName = (dateString) => {
  const days = [
    "sunday", "monday", "tuesday",
    "wednesday", "thursday", "friday", "saturday",
  ];
  const date = new Date(dateString);
  return days[date.getUTCDay()];
};

// Check if a date is in the past
export const isDateInPast = (dateString) => {
  const today = getTodayIST();
  return dateString < today;
};

// Generate time slots for a restaurant on a given date
// Slots every 30 minutes between open and close time
// e.g. open: "11:00", close: "23:00"
// → ["11:00", "11:30", "12:00", ...]
export const generateTimeSlots = (openTime, closeTime, intervalMinutes = 30) => {
  const slots = [];

  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Stop 30 mins before closing — last slot shouldnt be at closing time
  while (currentMinutes < closeMinutes - intervalMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    );
    currentMinutes += intervalMinutes;
  }

  return slots;
};

// Check if a given time slot is still bookable today
// e.g. if current time is 19:45, slot "19:00" is not bookable
// but slot "20:00" is
export const isSlotBookableToday = (dateString, slotTime) => {
  const today = getTodayIST();

  // If not today, always bookable (future date)
  if (dateString !== today) return true;

  const now = getNowIST();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const [slotHour, slotMin] = slotTime.split(":").map(Number);
  const slotMinutes = slotHour * 60 + slotMin;

  // Need at least 60 mins advance booking
  return slotMinutes > currentMinutes + 60;
};

// Parse natural language date from AI
// Handles "today", "tomorrow", "this saturday" etc
export const parseNaturalDate = (input) => {
  const lower = input.toLowerCase().trim();
  const today = getNowIST();

  if (lower === "today") {
    return getTodayIST();
  }

  if (lower === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Handle "this saturday", "next friday" etc
  const days = [
    "sunday", "monday", "tuesday",
    "wednesday", "thursday", "friday", "saturday",
  ];

  const matchedDay = days.find((d) => lower.includes(d));
  if (matchedDay) {
    const targetDay = days.indexOf(matchedDay);
    const currentDay = today.getUTCDay();
    let daysAhead = targetDay - currentDay;

    if (daysAhead <= 0) daysAhead += 7; // always go forward

    const result = new Date(today);
    result.setUTCDate(result.getUTCDate() + daysAhead);
    return result.toISOString().split("T")[0];
  }

  // Try direct parse as last resort
  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) {
    throw new ApiError(400, `Could not understand date: "${input}"`);
  }

  return parsed.toISOString().split("T")[0];
};