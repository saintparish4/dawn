import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { PaymentService } from "../../../src/services/payment/payment.service";
import { BlockchainService } from "../../../src/services/payment/blockchain.service";
import QRCode from "qrcode";
import { PaymentRepository } from "@/backend/src/repositories/payment.repository";

// Mock QRCode
jest.mock("qrcode");
const mockQRCode = QRCode as jest.Mocked<typeof QRCode>;

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let mockPaymentRepo: jest.Mocked<PaymentRepository>;
  let mockBlockchainService: jest.Mocked<BlockchainService>;

  beforeEach(() => {
    mockPaymentRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findByMerchant: jest.fn(),
      findExpiredPayments: jest.fn(),
    } as any;

    mockBlockchainService = {
      getTransaction: jest.fn(),
      getTransactionReceipt: jest.fn(),
      estimateGasFee: jest.fn(),
      getCurrentBlockNumber: jest.fn(),
    } as any;

    paymentService = new PaymentService(mockPaymentRepo, mockBlockchainService);
  });

  describe("createPayment", () => {
    it("should create payment with QR code", async () => {
      // Arrange
      const paymentData = {
        merchantId: "merchant-123",
        amount: "100.50",
        currency: "USDC" as const,
        merchantReference: "ORDER-12345",
      };

      const mockQRCodeData = "data:image/png;base64,mockqrcode";
      (mockQRCode.toDataURL as any).mockResolvedValue(mockQRCodeData);

      const createdPayment = {
        id: "payment-123",
        merchant_id: paymentData.merchantId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: "pending",
        payment_url: expect.stringContaining("/pay"),
        qr_code: mockQRCodeData,
        expires_at: expect.any(Date),
        network: "ethereum",
        merchant_reference: paymentData.merchantReference,
      };

      mockPaymentRepo.create.mockResolvedValue(createdPayment as any);

      // Act
      const result = await paymentService.createPayment(paymentData);

      // Assert
      expect(result).toEqual({
        id: createdPayment.id,
        amount: createdPayment.amount,
        currency: createdPayment.currency,
        status: createdPayment.status,
        paymentUrl: createdPayment.payment_url,
        qrCode: createdPayment.qr_code,
        expiresAt: createdPayment.expires_at,
      });

      expect(mockQRCode.toDataURL).toHaveBeenCalledWith(
        expect.stringContaining("/pay")
      );

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          merchant_id: paymentData.merchantId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          merchant_reference: paymentData.merchantReference,
          network: "ethereum",
          status: "pending",
        })
      );
    });

    it("should set expiration time to 30 minutes from creation", async () => {
      // Arrange
      const paymentData = {
        merchantId: "merchant-123",
        amount: "50.00",
        currency: "USDC" as const,
      };

      mockQRCode.toDataURL.mockResolvedValue("mockqr" as never);
      mockPaymentRepo.create.mockResolvedValue({} as any);

      const startTime = Date.now();

      // Act
      await paymentService.createPayment(paymentData);

      // Assert
      const createCall = mockPaymentRepo.create.mock.calls[0][0];
      const expirationTime = createCall.expires_at!.getTime();
      const expectedExpiration = startTime + 30 * 60 * 1000; // 30 minutes

      expect(expirationTime).toBeGreaterThan(startTime + 29 * 60 * 1000);
      expect(expirationTime).toBeLessThan(startTime + 31 * 60 * 1000);
    });
  });

  describe("getPayment", () => {
    it("should return payment details when found", async () => {
      // Arrange
      const paymentId = "payment-123";
      const payment = {
        id: paymentId,
        amount: "100.50",
        currency: "USDC",
        status: "completed",
        payment_url: "https://pay.dawn.com/pay/payment-123",
        qr_code: "mockqrcode",
        expires_at: new Date(),
        transaction_hash: "0x123...abc",
        network: "ethereum",
      };

      mockPaymentRepo.findById.mockResolvedValue(payment as any);

      // Act
      const result = await paymentService.getPayment(paymentId);

      // Assert
      expect(result).toEqual({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentUrl: payment.payment_url,
        qrCode: payment.qr_code,
        expiresAt: payment.expires_at,
        transactionHash: payment.transaction_hash,
        network: payment.network,
      });
    });

    it("should throw error when payment not found", async () => {
      // Arrange
      mockPaymentRepo.findById.mockResolvedValue(null);

      // Act + Assert
      await expect(paymentService.getPayment("nonexistent")).rejects.toThrow(
        "Payment not found"
      );
    });
  });
});
