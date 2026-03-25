import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// Helper to create rate limiters — reusable!
const createRateLimiter = (windowMinutes, maxRequests, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: message,
    standardHeaders: true,  // Return rate limit info in headers
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      // Use our ApiError format instead of default response
      next(new ApiError(429, options.message));
    },
  });
};

// For auth routes — strict! 5 attempts per 15 mins
export const authRateLimiter = createRateLimiter(
  15,
  5,
  "Too many login attempts. Please try again after 15 minutes"
);

// For general API routes — 100 requests per 10 mins
export const apiRateLimiter = createRateLimiter(
  10,
  100,
  "Too many requests. Please slow down!"
);

// For chat/AI route — 30 messages per minute per user
// AI calls are expensive, we dont want abuse!
export const chatRateLimiter = createRateLimiter(
  1,
  30,
  "Too many messages. Please wait a moment before sending more"
);