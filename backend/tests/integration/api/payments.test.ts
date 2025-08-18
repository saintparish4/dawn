import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../../src/app";
import { testDb } from "../../setup/test-setup";
import { merchantFixtures } from "../../fixtures/merchants";
import { paymentFixtures } from "../../fixtures/payments";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

describe("Payment API", () => {
  let authToken: string;
  let merchantId: string;

  beforeEach(async () => {
    // Setup test merchant
    const merchant = merchantFixtures.validMerchant;
    merchantId = merchant.id;

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

    // Generate auth token
    authToken = jwt.sign(
      {
        id: merchant.id,
        email: merchant.email,
        merchantId: merchant.id,
        role: "merchant",
      },
      process.env.JWT_SECRET!
    );
  });

  describe("POST /api/v1/payments", () => {
    it("should create payment successfully", async () => {
      // Arrange
      const paymentData = {
        amount: "100.50",
        currency: "USDC",
        merchantReference: "ORDER-12345",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(paymentData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          id: expect.any(String),
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: "pending",
          paymentUrl: expect.stringContaining("/pay/"),
          qrCode: expect.stringContaining("data:image/png;base64,"),
          expiresAt: expect.any(String),
        },
        message: "Payment created successfully",
        timestamp: expect.any(String),
      });

      // Verify in database
      const dbResult = await testDb.query(
        "SELECT * FROM payments WHERE merchant_id = $1",
        [merchantId]
      );
      expect(dbResult.rows).toHaveLength(1);
      expect(dbResult.rows[0].amount).toBe(paymentData.amount);
      expect(dbResult.rows[0].currency).toBe(paymentData.currency);
    });

    it("should reject invalid amount format", async () => {
      // Arrange
      const invalidPayment = {
        amount: "invalid-amount",
        currency: "USDC",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidPayment);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("amount");
    });

    it("should reject unauthorized request", async () => {
      // Arrange
      const paymentData = {
        amount: "100.50",
        currency: "USDC",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/payments")
        .send(paymentData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Access denied. No token provided.");
    });
  });

  describe("GET /api/v1/payments", () => {
    beforeEach(async () => {
      // Insert test payments
      const payment1 = paymentFixtures.validPayment;
      const payment2 = paymentFixtures.completedPayment;

      await testDb.query(
        `
            INSERT INTO payments (id, merchant_id, amount, currency, status, payment_url, qr_code, expires_at, network, merchant_reference)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
                   ($11, $12, $13, $14, $15, $16, $17, $18, $19, $20) 
            `,
        [
          payment1.id,
          payment1.merchant_id,
          payment1.amount,
          payment1.currency,
          payment1.status,
          payment1.payment_url,
          payment1.qr_code,
          payment1.expires_at,
          payment1.network,
          payment1.merchant_reference,
          payment2.id,
          payment2.merchant_id,
          payment2.amount,
          payment2.currency,
          payment2.status,
          payment2.payment_url,
          payment2.qr_code,
          payment2.expires_at,
          payment2.network,
          null,
        ]
      );
    });

    it("should return paginated payment list", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            amount: expect.any(String),
            currency: "USDC",
            status: expect.any(String),
          }),
        ]),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
        timestamp: expect.any(String),
      });

      expect(response.body.data).toHaveLength(2);
    });

    it("should handle pagination correctly", async () => {
      // Act
      const response = await request(app)
        .get("/api/v1/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 2, limit: 1 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
      });
    });
  });

  describe("GET /api/v1/payments/:id", () => {
    beforeEach(async () => {
      // Insert test payment
      const payment = paymentFixtures.validPayment;
      await testDb.query(
        `
            INSERT INTO payments (id, merchant_id, amount, currency, status, payment_url, qr_code, expires_at, network)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            `,
        [
          payment.id,
          payment.merchant_id,
          payment.amount,
          payment.currency,
          payment.status,
          payment.payment_url,
          payment.qr_code,
          payment.expires_at,
          payment.network,
        ]
      );
    });

    it("should return payment details", async () => {
      // Act
      const response = await request(app)
        .get(`/apu/v1/payments/${paymentFixtures.validPayment.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          id: paymentFixtures.validPayment.id,
          amount: paymentFixtures.validPayment.amount,
          currency: paymentFixtures.validPayment.currency,
          status: paymentFixtures.validPayment.status,
          paymentUrl: paymentFixtures.validPayment.payment_url,
          qrCode: paymentFixtures.validPayment.qr_code,
          expiresAt: expect.any(String),
          transactionHash: null,
          network: paymentFixtures.validPayment.network,
        },
        timestamp: expect.any(String),
      });
    });

    it("should return 404 for non-existent payment", async () => {
      // Act
      const response = await request(app)
        .get(`/api/v1/payments/non-existent-id`)
        .set("Authorization", `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Payment not found");
    });
  });
});
