import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Logging — only in development
if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "GoodFoods API is running" });
});

// Routes will be imported here later
// app.use("/api/v1/auth", authRoutes);

// Apply general rate limiter to all API routes
app.use("/api", apiRateLimiter);

// Global error handler — always last!
app.use(errorMiddleware);

export { app };