// Error Handling Utility - src/lib/errorHandler.js
export class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleApiError = (error) => {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  // Handle mongoose validation errors
  if (error.name === "ValidationError") {
    return {
      message: Object.values(error.errors)
        .map((e) => e.message)
        .join(", "),
      statusCode: 400,
    };
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      message: `${field} already exists`,
      statusCode: 409,
    };
  }

  return {
    message: "Internal server error",
    statusCode: 500,
  };
};
