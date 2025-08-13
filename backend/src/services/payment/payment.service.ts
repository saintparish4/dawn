import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { PaymentRepository } from "../../repositories/payment.repository";
import { BlockchainService } from "./blockchain.service";

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private blockchainService: BlockchainService
  ) {}

  async createPayment(data: {
    merchantId: string;
    amount: string;
    currency: "USDC";
    merchantReference?: string;
  }) {
    const paymentId = uuidv4();
    const paymentUrl = `https://pay.usdc.com/pay/${paymentId}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(paymentUrl);

    // Set expiration (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const payment = await this.paymentRepo.create({
      id: paymentId,
      merchant_id: data.merchantId,
      amount: data.amount,
      currency: data.currency,
      status: "pending",
      payment_url: paymentUrl,
      qr_code: qrCode,
      expires_at: expiresAt,
      network: "ethereum", // Default to Ethereum
      merchant_reference: data.merchantReference,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentUrl: payment.payment_url,
      qrCode: payment.qr_code,
      expiresAt: payment.expires_at,
    };
  }

  async getPayment(paymentId: string) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentUrl: payment.payment_url,
      qrCode: payment.qr_code,
      expiresAt: payment.expires_at,
      transactionHash: payment.transaction_hash,
      network: payment.network,
    };
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    transactionHash?: string
  ) {
    return await this.paymentRepo.updateStatus(
      paymentId,
      status,
      transactionHash
    );
  }

  async getPaymentsByMerchant(
    merchantId: string,
    page: number = 1,
    limit: number = 20
  ) {
    return await this.paymentRepo.findByMerchant(merchantId, page, limit);
  }
}
