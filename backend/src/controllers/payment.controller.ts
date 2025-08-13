import { Request, Response } from "express";
import { PaymentService } from "../services/payment/payment.service";
import {
  ApiResponse,
  AuthRequest,
  PaginatedResponse,
} from "../types/api.types";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount, currency, merchantReference } = req.body;
      const merchantId = req.user?.merchantId;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: "Merchant ID not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payment = await this.paymentService.createPayment({
        merchantId,
        amount,
        currency,
        merchantReference,
      });

      const response: ApiResponse = {
        success: true,
        data: payment,
        message: "Payment created successfully",
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
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

  getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { paymentId } = req.params;

      const payment = await this.paymentService.getPayment(paymentId);

      const response: ApiResponse = {
        success: true,
        data: payment,
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

      res.status(404).json(response);
    }
  };

  getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.paymentService.getPaymentsByMerchant(
        merchantId,
        page,
        limit
      );

      const response: PaginatedResponse<any> = {
        success: true,
        data: result.payments,
        pagination: result.pagination,
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

  updatePaymentStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { paymentId } = req.params;
      const { status, transactionHash } = req.body;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          error: "Payment ID is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const payment = await this.paymentService.updatePaymentStatus(
        paymentId,
        status,
        transactionHash
      );

      const response: ApiResponse = {
        success: true,
        data: payment,
        message: "Payment status updated successfully",
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
