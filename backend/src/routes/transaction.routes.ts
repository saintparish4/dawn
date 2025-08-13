import { Router } from "express";
import { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { apiRateLimiter } from "../middleware/rate-limit.middleware";
import { AuthRequest, ApiResponse } from "../types/api.types";

const router = Router();

// All transaction routes require authentication
router.use(authMiddleware);
router.use(apiRateLimiter);

// Get transaction by hash
router.get(
  "/:transactionHash",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionHash } = req.params;

      // TODO: Implement transaction service
      const response: ApiResponse = {
        success: true,
        data: { transactionHash, status: "pending" },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: "Transaction not found",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  }
);

export { router as transactionRoutes };
