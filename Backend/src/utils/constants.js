export const USER_ROLES = {
  USER: "user",
  OWNER: "owner",
  ADMIN: "admin",
};

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium",
  FEATURED: "featured",
};

export const PLAN_LIMITS = {
  free: {
    restaurants: 1,
    imagesPerRestaurant: 3,
    menuItems: 20,
    analytics: false,
    aiMarketing: false,
    featured: false,
  },
  premium: {
    restaurants: 5,
    imagesPerRestaurant: 10,
    menuItems: -1, // unlimited
    analytics: true,
    aiMarketing: true,
    featured: false,
  },
  featured: {
    restaurants: -1, // unlimited
    imagesPerRestaurant: -1,
    menuItems: -1,
    analytics: true,
    aiMarketing: true,
    featured: true, // Appears first in AI search!
  },
};

export const PLAN_PRICES = {
  free: 0,
  premium: 2999, // ₹2999/month
  featured: 5999, // ₹5999/month
};

export const CUISINE_TYPES = [
  "Indian", "Italian", "Chinese", "Continental",
  "Mexican", "Japanese", "Thai", "Mediterranean",
];

export const AMBIANCE_TYPES = [
  "casual", "fine_dining", "family", "romantic",
  "business", "rooftop", "outdoor", "cafe",
];

export const AMENITIES = [
  "wifi", "parking", "live_music", "craft_beer",
  "valet", "outdoor_seating", "private_dining",
  "wheelchair_accessible",
];