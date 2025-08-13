import { Router } from "express";
import { Request, Response } from "express";
import { webhookVerification } from "../middleware/security.middleware";
import { ApiResponse } from "../types/api.types";

const router = Router();

// Webhook endpoint for payment status updates
router.post(
  "/payment-status",
  webhookVerification,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentId, status, transactionHash } = req.body;

      // TODO: Implement webhook processing service
      console.log("Received webhook for payment:", {
        paymentId,
        status,
        transactionHash,
      });

      const response: ApiResponse = {
        success: true,
        message: "Webhook received successfully",
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

// Webhook endpoint for transaction confirmations
router.post(
  "/transaction-confirmation",
  webhookVerification,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionHash, confirmations, status } = req.body;

      // TODO: Implement transaction confirmation service
      console.log("Transaction confirmation received:", {
        transactionHash,
        confirmations,
        status,
      });

      const response: ApiResponse = {
        success: true,
        message: "Transaction confirmation received successfully",
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

export { router as webhookRoutes };