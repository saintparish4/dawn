import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../src/app";
import { testDb } from "../setup/test-setup";

describe("End-to-End Payment Flow", () => {
  let merchantToken: string;
  let merchantId: string;
  let paymentId: string;

  it("should complete full payment lifecycle", async () => {
    // Step 1: Register Merchant
    const registrationResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "e2e-merchant@example.com",
        password: "TestPassword123!",
        businessName: "E2E Test Business",
        businessType: "ecommerce",
      });

    expect(registrationResponse.status).toBe(201);
    merchantId = registrationResponse.body.data.id;

    // Step 2: Login Merchant
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "e2e-merchant@example.com",
      password: "TestPassword123!",
    });

    expect(loginResponse.status).toBe(200);
    merchantToken = loginResponse.body.data.token;

    // Step 3: Create Payment
    const paymentResponse = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({
        amount: "150.75",
        currency: "USDC",
        merchantReference: "E2E-ORDER-001",
      });

    expect(paymentResponse.status).toBe(201);
    paymentId = paymentResponse.body.data.id;
    expect(paymentResponse.body.data.amount).toMatchObject({
      amount: "150.75",
      currency: "USDC",
      status: "pending",
      paymentUrl: expect.stringContaining("/pay/"),
      qrCode: expect.stringContaining("data:image/png;base64,"),
    });

    // Step 4: Retrieve Payment Details
    const getPaymentResponse = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set("Authorization", `Bearer ${merchantToken}`);

    expect(getPaymentResponse.status).toBe(200);
    expect(getPaymentResponse.body.data).toBe("pending");

    // Step 5: Update Payment Status (simulate blockchain confirmation)
    const updateResponse = await request(app)
      .patch(`/api/v1/payments/${paymentId}/status`)
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({
        status: "completed",
        transactionHash:
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.status).toBe("completed");

    // Step 6: Verify Payment in List
    const listResponse = await request(app)
      .get("/api/v1/payments")
      .set("Authorization", `Bearer ${merchantToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0]).toMatchObject({
      id: paymentId,
      amount: "150.75",
      status: "completed",
    });

    // Step 7: Check system Health
    const healthResponse = await request(app).get("/api/v1/system/health");

    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.data.status).toBe("healthy");

    // Verify database state
    const dbPayment = await testDb.query(
      "SELECT * FROM payments WHERE id = $1",
      [paymentId]
    );

    expect(dbPayment.rows[0]).toMatchObject({
      id: paymentId,
      merchant_id: merchantId,
      amount: "150.75",
      currency: "USDC",
      status: "completed",
      merchant_reference: "E2E-ORDER-001",
      transaction_hash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    });
  });

  it("should handle merchant onboarding flow", async () => {
    // Step 1: Register new merchant
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email: "onboarding-test@example.com",
        password: "TestPassword123!",
        businessName: "Onboarding Test Business",
        businessType: "retail",
      });

    expect(registerResponse.status).toBe(201);
    const newMerchantId = registerResponse.body.data.id;

    // Step 2: Login
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "onboarding-test@example.com",
      password: "TestPassword123!",
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.data.token;

    // Step 3: Get Initial Profile
    const profileResponse = await request(app)
      .get("/api/v1/merchants/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.data).toMatchObject({
      id: newMerchantId,
      email: "onboarding-test@example.com",
      status: "pending",
      kycStatus: "pending",
    });

    // Step 4: Update profile with wallet details
    const updateResponse = await request(app)
    .patch('/api/v1/merchants/profile')
    .set('Authorization', `Bearer ${token}`)
    .send({
        walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
        settlementAddress: '0x8ba1f109551bD432803012645Ac13a85694aD1B7',
        webhookUrl: 'https://example.com/webhooks/dawn' 
    });

    expect(updateResponse.status).toBe(200);

    // Step 5: Configure webhook settings
    const webhookResponse = await request(app)
    .post('/api/v1/merchants/webhook')
    .set('Authorization', `Bearer ${token}`)
    .send({
        webhookUrl: 'https://example.com/webhooks/payment-updates' 
    });
    
    expect(webhookResponse.status).toBe(200);
    expect(webhookResponse.body.data).toHaveProperty('webhookSecret');

    // Step 6: Regenerate API key
    const apiKeyResponse = await request(app)
    .post('/api/v1/merchants/regenerate-api-key')
    .set('Authorization', `Bearer ${token}`);

    expect(apiKeyResponse.status).toBe(200);
    expect(apiKeyResponse.body.data.apiKey).toMatch(/^[a-zA-Z0-9]{32}$/);

    // Verify all changes in database
    const dbMerchant = await testDb.query(
        'SELECT * FROM merchants WHERE id = $1',
        [newMerchantId] 
    );

    expect(dbMerchant.rows[0]).toMatchObject({
        wallet_address: '0x742f1353b722927D28B00c21Fd36e0EfC3453927',
        settlement_address: '0x8ba1f109551bD432803012645Ac13a85694aD1B7',
        webhook_url: 'https://example.com/webhooks/payment-updates', 
    });
    expect(dbMerchant.rows[0].webhook_secret).toBeTruthy();
    expect(dbMerchant.rows[0].api_key).toMatch(/^[a-zA-Z0-9]{32}$/);
  });
});
