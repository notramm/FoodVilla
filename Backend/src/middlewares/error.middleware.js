import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

export const errorMiddleware = (err, req, res, next) => {
  // Start with defaults
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // -----------------------------------------------
  // Handle specific error types
  // -----------------------------------------------

  // Mongoose validation error
  // Happens when model validation fails (required fields etc)
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose cast error
  // Happens when invalid ObjectId is passed
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB duplicate key error
  // Happens when unique field already exists (email etc)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors — just in case they slip through
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // -----------------------------------------------
  // Send response
  // -----------------------------------------------

  // In production — dont leak stack trace to client!
  // In development — show it for debugging
  const response = {
    success: false,
    statusCode,
    message,
    errors,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  };

  // Log error on server side always
  if (ENV.NODE_ENV === "development") {
    console.error("ERROR:", err);
  } else {
    // In production only log serious errors
    if (statusCode >= 500) {
      console.error("CRITICAL ERROR:", err);
    }
  }

  return res.status(statusCode).json(response);
};