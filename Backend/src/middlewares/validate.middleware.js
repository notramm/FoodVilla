import { ApiError } from "../utils/ApiError.js";

// This middleware takes a zod schema and validates req.body against it
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Extract all error messages from zod and join them
    const errorMessages = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return next(
      new ApiError(400, "Validation failed", errorMessages)
    );
  }

  // Replace req.body with parsed/cleaned data from zod
  req.body = result.data;
  next();
};

export { validate };