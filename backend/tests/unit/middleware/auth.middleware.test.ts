import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  authMiddleware,
  adminMiddleware,
} from "../../../src/middleware/auth.middleware";
import { AuthRequest } from "../../../src/types/api.types";

describe("Auth Middleware", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn() as jest.MockedFunction<Request['header']>,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn() as jest.MockedFunction<Response['json']>,
    };
    mockNext = jest.fn();
  });

  describe("authMiddleware", () => {
    it("should authenticate valid JWT token", async () => {
      // Arrange
      const tokenPayload = {
        id: "merchant-123",
        email: "test@example.com",
        merchantId: "merchant-123",
        role: "merchant",
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!);
      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      // Act
      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. No token provided.",
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject invalid token", async () => {
      // Arrange
      (mockRequest.header as jest.Mock).mockReturnValue("Bearer invalid-token");

      // Act
      await authMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid token.",
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("adminMiddleware", () => {
    it("should allow admin access", async () => {
      // Arrange
      mockRequest.user = {
        id: "admin-123",
        email: "admin@example.com",
        role: "admin",
      };

      // Act
      await adminMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("should deny non-admin access", async () => {
      // Arrange
      mockRequest.user = {
        id: "merchant-123",
        email: "merchant@example.com",
        role: "merchant",
      };

      // Act
      await adminMiddleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Access denied. Admin access required.",
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
