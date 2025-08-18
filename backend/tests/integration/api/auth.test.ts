import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../../src/app";
import { testDb } from "../../setup/test-setup";
import { merchantFixtures } from "../../fixtures/merchants";
import bcrypt from "bcryptjs";

describe("Authentication API", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register new merchant successfully", async () => {
      // Arrange
      const registrationData = {
        email: "newmerchant@example.com",
        password: "TestPassword123!",
        businessName: "New Test Business",
        businessType: "ecommerce",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(registrationData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          id: expect.any(String),
          email: registrationData.email,
          businessName: registrationData.businessName,
          status: "pending",
          apiKey: expect.any(String),
        },
        message: "Merchant registered successfully",
        timestamp: expect.any(String),
      });

      // Verify in database
      const dbResult = await testDb.query(
        "SELECT * FROM merchants WHERE email = $1",
        [registrationData.email]
      );
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].business_name).toBe(
        registrationData.businessName
      );
    });

    it("should return validation error for invalid email", async () => {
      // Arrange
      const invalidData = {
        email: "invalid-email",
        password: "TestPassword123!",
        businessName: "New Test Business",
        businessType: "ecommerce",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("email");
    });

    it("should return error for duplicate email", async () => {
      // Arrange - Insert existing merchant
      const existingMerchant = merchantFixtures.validMerchant;
      await testDb.query(
        `
                INSERT INTO merchants (id, email, password_hash, business_name, business_type, status, kyc_status, api_key)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `,
        [
          existingMerchant.id,
          existingMerchant.email,
          await bcrypt.hash(existingMerchant.password, 12),
          existingMerchant.business_name,
          existingMerchant.business_type,
          existingMerchant.status,
          existingMerchant.kyc_status,
          existingMerchant.api_key,
        ]
      );

      const duplicateData = {
        email: existingMerchant.email,
        password: "TestPassword123!",
        businessName: "Duplicate Business",
        businessType: "ecommerce",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(duplicateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Merchant already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Insert test merchant
      const merchant = merchantFixtures.validMerchant;
      await testDb.query(
        `
                INSERT INTO merchants (id, email, password_hash, business_name, business_type, status, kyc_status, api_key)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                `,
        [
          merchant.id,
          merchant.email,
          await bcrypt.hash(merchant.password, 12),
          merchant.business_name,
          merchant.business_type,
          merchant.status,
          merchant.kyc_status,
          merchant.api_key,
        ]
      );
    });

    it("should login successfully with valid credentials", async () => {
      // Arrange
      const loginData = {
        email: merchantFixtures.validMerchant.email,
        password: merchantFixtures.validMerchant.password,
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          token: expect.any(String),
          merchant: {
            id: merchantFixtures.validMerchant.id,
            email: merchantFixtures.validMerchant.email,
            businessName: merchantFixtures.validMerchant.business_name,
            status: merchantFixtures.validMerchant.status,
            kycStatus: merchantFixtures.validMerchant.kyc_status,
          },
        },
        message: "Login successful",
        timestamp: expect.any(String),
      });

      // Verify JWT token
      expect(response.body.data.token).toMatch(
        /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
      );
    });

    it("should reject invalid credentials", async () => {
      // Arrange
      const invalidLogin = {
        email: merchantFixtures.validMerchant.email,
        password: "WrongPassword123!",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(invalidLogin);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should reject suspended account", async () => {
      // Arrange - Insert suspended merchant
      const suspendedMerchant = merchantFixtures.suspendedMerchant;
      await testDb.query(
        `
                INSERT INTO merchants (id, email, password_hash, business_name, business_type, status, kyc_status, api_key)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                `,
        [
          suspendedMerchant.id,
          suspendedMerchant.email,
          await bcrypt.hash(suspendedMerchant.password, 12),
          suspendedMerchant.business_name,
          suspendedMerchant.business_type,
          suspendedMerchant.status,
          suspendedMerchant.kyc_status,
          suspendedMerchant.api_key,
        ]
      );

      const loginData = {
        email: suspendedMerchant.email,
        password: suspendedMerchant.password,
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Account is not active");
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limiting on auth endpoints", async () => {
      // Arrange
      const invalidLogin = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      // Act - Make 6 failed attempts (limit is 5)
      const requests = Array(6)
        .fill(null)
        .map(() => request(app).post("/api/v1/auth/login").send(invalidLogin));

      const responses = await Promise.all(requests);

      // Assert
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toBe(
        "Too many requests. Please try again later."
      );
    });
  });
});
