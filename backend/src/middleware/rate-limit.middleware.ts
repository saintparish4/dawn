import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: "Too many requests. Please try again later.", // TODO: Add more specific error message
    timestamp: new Date().toISOString(),
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: "Rate limit exceeded. Please try again later.", // TODO: Add more specific error message
    timestamp: new Date().toISOString(),
  },
});

// TODO: Add more rate limiters for different endpoints