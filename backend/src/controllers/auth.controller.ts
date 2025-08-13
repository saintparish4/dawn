import { Request, Response } from "express";
import { AuthService } from "../services/auth/auth.service";
import { ApiResponse, AuthRequest } from "../types/api.types";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, businessName, businessType } = req.body;

      const merchant = await this.authService.register({
        email,
        password,
        businessName,
        businessType,
      });

      const response: ApiResponse = {
        success: true,
        data: merchant,
        message: "Merchant registered successfully",
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

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Login successful",
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
      res.status(401).json(response);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const merchantId = req.user!.id;

      const result = await this.authService.refreshToken(merchantId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Token refreshed successfully",
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

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    // In a stateless JWT system, logout is handled client-side
    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  };
}
