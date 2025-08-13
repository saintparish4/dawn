import { Router } from "express";
import { Request, Response } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { ApiResponse } from "../types/api.types";

const router = Router();

// Public health check
router.get("/health", async (req: Request, res: Response): Promise<void> => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
});

// System status (admin only)
router.get(
  "/status",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse = {
        success: true,
        data: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred", // Add more detailed error message
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  }
);

// Database health check (admin only)
router.get(
  "/database",
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement database health check
      const response: ApiResponse = {
        success: true,
        data: {
          status: "connected",
          latency: "5ms",
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        timestamp: new Date().toISOString(),
      };

      res.status(500).json(response);
    }
  }
);

export { router as systemRoutes };
