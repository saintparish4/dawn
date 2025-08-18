import { describe, expect, it, beforeAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";

describe("Load Testing - Concurrent Payments", () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test merchant and token
    authToken = jwt.sign(
      {
        id: "load-test-merchant",
        email: "loadtest@example.com",
        merchantId: "load-test-merchant",
        role: "merchant",
      },
      process.env.JWT_SECRET!
    );
  });

  it("should handle 100 concurrent payment requests", async () => {
    // Arrange
    const concurrentRequests = 100;
    const paymentData = {
      amount: "10.00",
      currency: "USDC",
      merchantReference: "LOAD-TEST-",
    };

    // Act
    const startTime = Date.now();
    const requests = Array(concurrentRequests)
      .fill(null)
      .map((_, index) =>
        request(app)
          .post("/api/v1/payments")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            ...paymentData,
            merchantReference: `${paymentData.merchantReference}${index}`,
          })
      );

    const responses = await Promise.all(requests);
    const endTime = Date.now();

    // Assert
    const successfulResponses = responses.filter((res) => res.status === 201);
    const failedResponses = responses.filter((res) => res.status !== 201);

    console.log(`Load Test Results:
            - Total Requests: ${concurrentRequests}
            - Successful: ${successfulResponses.length}
            - Failed: ${failedResponses.length}
            - Duration: ${endTime - startTime}ms
            - Average Response Time: ${
              (endTime - startTime) / concurrentRequests
            }ms
        `);

    // At least 90% success rate expected
    expect(
      successfulResponses.length / concurrentRequests
    ).toBeGreaterThanOrEqual(0.9);

    // All successful requests should have valid payment data
    successfulResponses.forEach((response) => {
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        amount: "10.00",
        currency: "USDC",
        status: "pending",
        paymentUrl: expect.stringContaining("/pay/"),
        qrCode: expect.stringContaining("data:image/png;base64,"),
      });
    });
  });

  it("should maintain response time under 500ms for payment creation", async () => {
    // Arrange
    const paymentData = {
      amount: "25.50",
      currency: "USDC",
    };

    // Act - Test 20 sequential requests to measure average response time
    const responseTimes: number[] = [];

    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();

      const response = await request(app)
        .post("/api/v1/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(paymentData);

      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);

      expect(response.status).toBe(201);
    }

    // Assert
    const averageResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);

    console.log(`Response Time Analysis:
            - Average: ${averageResponseTime}ms
            - Maximum: ${maxResponseTime}ms
            - All times: ${responseTimes.join(", ")}ms
        `);

    expect(averageResponseTime).toBeLessThan(500);
    expect(maxResponseTime).toBeLessThan(1000);
  });
});
