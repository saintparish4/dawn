import { AuthService } from "../../../src/services/auth/auth.service";
import { MerchantRepository } from "../../../src/repositories/merchant.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { describe, expect, it, beforeEach, jest } from "@jest/globals";

describe("AuthService", () => {
  let authService: AuthService;
  let mockMerchantRepo: jest.Mocked<MerchantRepository>;

  beforeEach(() => {
    mockMerchantRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByApiKey: jest.fn(),
      findAll: jest.fn(),
    } as any;

    authService = new AuthService(mockMerchantRepo);
  });

  describe("register", () => {
    it("should successfully register a new merchant", async () => {
      // Arrange
      const registrationData = {
        email: "test@example.com",
        password: "password123",
        businessName: "Test Business",
        businessType: "ecommerce",
      };

      mockMerchantRepo.findByEmail.mockResolvedValue(null);
      mockMerchantRepo.create.mockResolvedValue({
        id: "merchant-id",
        email: registrationData.email,
        business_name: registrationData.businessName,
        business_type: registrationData.businessType,
        status: "pending",
        api_key: "api-key-123",
      } as any);

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(result).toEqual({
        id: "merchant-id",
        email: registrationData.email,
        business_name: registrationData.businessName,
        status: "pending",
        api_key: "api-key-123",
      });

      expect(mockMerchantRepo.findByEmail).toHaveBeenCalledWith(
        registrationData.email
      );
      expect(mockMerchantRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registrationData.email,
          business_name: registrationData.businessName,
          business_type: registrationData.businessType,
          status: "pending",
          kyc_status: "pending",
        })
      );
    });

    it("should throw error if merchant already exists", async () => {
      // Arrange
      const registrationData = {
        email: "existing@example.com",
        password: "password123",
        businessName: "Existing Business",
        businessType: "ecommerce",
      };

      mockMerchantRepo.findByEmail.mockResolvedValue({
        id: "existing-merchant-id",
        email: registrationData.email,
      } as any);

      // Act & Assert
      await expect(authService.register(registrationData)).rejects.toThrow(
        "Merchant already exists"
      );
    });

    it("should hash password before storing", async () => {
      // Arrange
      const registrationData = {
        email: "test@example.com",
        password: "PlainTextPassword123",
        businessName: "Test Business",
        businessType: "ecommerce",
      };

      mockMerchantRepo.findByEmail.mockResolvedValue(null);
      mockMerchantRepo.create.mockResolvedValue({
        id: "merchant-id",
        password_hash: "hashed_password_123",
      } as any);

      // Act
      await authService.register(registrationData);

      // Assert
      const createCall = mockMerchantRepo.create.mock.calls[0][0];
      expect(createCall.password_hash).not.toBe(registrationData.password);
      expect(
        await bcrypt.compare(
          registrationData.password,
          createCall.password_hash!
        )
      ).toBe(true);
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 12);

      const merchant = {
        id: "merchant-id",
        email,
        password_hash: hashedPassword,
        business_name: "Test Business",
        status: "active",
        kyc_status: "verified",
      };

      mockMerchantRepo.findByEmail.mockResolvedValue(merchant as any);

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(result).toEqual({
        token: expect.any(String),
        merchant: {
          id: merchant.id,
          email: merchant.email,
          business_name: merchant.business_name,
          status: merchant.status,
          kyc_status: merchant.kyc_status,
        },
      });

      // Verify JWT TOKEN
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;
      expect(decoded.id).toBe(merchant.id);
      expect(decoded.email).toBe(merchant.email);
      expect(decoded.role).toBe("merchant");
    });

    it("should throw error for invalid email", async () => {
      // Arrange
      mockMerchantRepo.findByEmail.mockResolvedValue(null);

      // Act + Assert
      await expect(
        authService.login("nonexistent@example.com", "password")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error for invalid password", async () => {
      // Arrange
      const email = "test@example.com";
      const hashedPassword = await bcrypt.hash("correctPassword", 12);

      mockMerchantRepo.findByEmail.mockResolvedValue({
        password_hash: hashedPassword,
        status: "active",
      } as any);

      // Act + Assert
      await expect(authService.login(email, "wrongpassword")).rejects.toThrow(
        "Invalid credentials"
      );
    });

    it("should throw error for suspended account", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 12);

      mockMerchantRepo.findByEmail.mockResolvedValue({
        password_hash: hashedPassword,
        status: "suspended",
      } as any);

      // Act + Assert
      await expect(authService.login(email, password)).rejects.toThrow(
        "Account suspended"
      );
    });
  });
});
