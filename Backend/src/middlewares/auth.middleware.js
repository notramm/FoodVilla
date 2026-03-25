import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ENV } from "../config/env.js";
import { USER_ROLES } from "../utils/constants.js";

// Verify JWT and attach user to request
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Token can come from cookies OR Authorization header
  // Why both? Mobile apps use header, browsers use cookies
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, ENV.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired");
    }
    throw new ApiError(401, "Invalid access token");
  }

  // Find user from decoded token
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Attach user to request — available in all next middlewares/controllers
  req.user = user;
  next();
});

// -------------------------------------------------------
// Role based access control
// Usage: authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.STAFF)
// -------------------------------------------------------
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(
        403,
        `Role '${req.user?.role}' is not allowed to access this resource`
      );
    }
    next();
  };
};