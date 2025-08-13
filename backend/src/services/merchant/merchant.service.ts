import { MerchantRepository } from "../../repositories/merchant.repository";

export class MerchantService {
  constructor(private merchantRepo: MerchantRepository) {}

  async getMerchantProfile(merchantId: string) {
    const merchant = await this.merchantRepo.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    return {
      id: merchant.id,
      email: merchant.email,
      businessName: merchant.business_name,
      businessType: merchant.business_type,
      status: merchant.status,
      kycStatus: merchant.kyc_status,
      walletAddress: merchant.wallet_address,
      settlementAddress: merchant.settlement_address,
      webhookUrl: merchant.webhook_url,
      createdAt: merchant.created_at,
    };
  }

  async updateMerchantProfile(
    merchantId: string,
    data: {
      business_name?: string;
      business_type?: string;
      wallet_address?: string;
      settlement_address?: string;
      webhook_url?: string;
    }
  ) {
    return await this.merchantRepo.update(merchantId, data);
  }

  async updateWebhookSettings(merchantId: string, webhookUrl: string) {
    const webhookSecret = require("crypto").randomBytes(32).toString("hex");

    return await this.merchantRepo.update(merchantId, {
      webhook_url: webhookUrl,
      webhook_secret: webhookSecret,
    });
  }
  async regenerateApiKey(merchantId: string) {
    const newApiKey = require("uuid").v4().replace(/-/g, "");

    await this.merchantRepo.update(merchantId, { api_key: newApiKey });

    return { apiKey: newApiKey };
  }
}
