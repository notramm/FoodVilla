import { Analytics } from "../models/Analytics.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { getTodayIST } from "./datetime.service.js";

// Track restaurant search appearance
export const trackSearchAppearance = async (restaurantIds) => {
  const today = getTodayIST();

  // Bulk update — increment searchAppearances for all restaurants
  await Promise.all(
    restaurantIds.map((restaurantId) =>
      Analytics.findOneAndUpdate(
        { restaurant: restaurantId, date: today },
        { $inc: { searchAppearances: 1 } },
        { upsert: true, new: true }
      )
    )
  );
};

// Track profile view
export const trackProfileView = async (restaurantId) => {
  const today = getTodayIST();

  await Analytics.findOneAndUpdate(
    { restaurant: restaurantId, date: today },
    { $inc: { profileViews: 1 } },
    { upsert: true, new: true }
  );
};

// Track booking made
export const trackBooking = async (restaurantId) => {
  const today = getTodayIST();

  await Analytics.findOneAndUpdate(
    { restaurant: restaurantId, date: today },
    { $inc: { bookingsMade: 1 } },
    { upsert: true, new: true }
  );
};

// Track AI mention
export const trackAIMention = async (restaurantId) => {
  const today = getTodayIST();

  await Analytics.findOneAndUpdate(
    { restaurant: restaurantId, date: today },
    { $inc: { aiMentions: 1 } },
    { upsert: true, new: true }
  );
};

// Get restaurant analytics summary
export const getRestaurantAnalytics = async (restaurantId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  const analytics = await Analytics.find({
    restaurant: restaurantId,
    date: { $gte: startDateStr },
  }).sort({ date: 1 });

  // Calculate totals
  const totals = analytics.reduce(
    (acc, day) => ({
      searchAppearances: acc.searchAppearances + day.searchAppearances,
      profileViews: acc.profileViews + day.profileViews,
      bookingsMade: acc.bookingsMade + day.bookingsMade,
      bookingsCancelled:
        acc.bookingsCancelled + day.bookingsCancelled,
      aiMentions: acc.aiMentions + day.aiMentions,
    }),
    {
      searchAppearances: 0,
      profileViews: 0,
      bookingsMade: 0,
      bookingsCancelled: 0,
      aiMentions: 0,
    }
  );

  // Conversion rate — bookings / profile views
  const conversionRate =
    totals.profileViews > 0
      ? ((totals.bookingsMade / totals.profileViews) * 100).toFixed(1)
      : 0;

  return {
    period: `Last ${days} days`,
    totals: { ...totals, conversionRate },
    daily: analytics,
  };
};

// Admin platform analytics
export const getPlatformAnalytics = async () => {
  const today = getTodayIST();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];

  const analytics = await Analytics.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: "$searchAppearances" },
        totalViews: { $sum: "$profileViews" },
        totalBookings: { $sum: "$bookingsMade" },
        totalAIMentions: { $sum: "$aiMentions" },
      },
    },
  ]);

  return analytics[0] || {
    totalSearches: 0,
    totalViews: 0,
    totalBookings: 0,
    totalAIMentions: 0,
  };
};