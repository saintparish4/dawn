import { Response } from "express";
import { MerchantService } from "../services/merchant/merchant.service";
import { ApiResponse, AuthRequest } from "../types/api.types";

export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const merchantId = req.user?.merchantId;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: "Merchant ID not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await this.merchantService.getMerchantProfile(merchantId);

      const response: ApiResponse = {
        success: true,
        data: profile,
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

      res.status(400).json(response);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const merchantId = req.user?.merchantId;
      const updateData = req.body;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: "Merchant ID not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const profile = await this.merchantService.updateMerchantProfile(
        merchantId,
        updateData
      );

      const response: ApiResponse = {
        success: true,
        data: profile,
        message: "Profile updated successfully",
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

      res.status(400).json(response);
    }
  };

  updateWebhookSettings = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const merchantId = req.user?.merchantId;
      const { webhookUrl } = req.body;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: "Merchant ID not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.merchantService.updateWebhookSettings(
        merchantId,
        webhookUrl
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Webhook settings updated successfully",
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

      res.status(400).json(response);
    }
  };

  regenerateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const merchantId = req.user?.merchantId;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: "Merchant ID not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.merchantService.regenerateApiKey(merchantId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: "API key regenerated successfully",
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

      res.status(400).json(response);
    }
  };
}
