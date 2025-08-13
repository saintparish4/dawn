import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { MerchantRepository } from "../../repositories/merchant.repository";

export class AuthService {
  constructor(private merchantRepo: MerchantRepository) {}

  async register(data: {
    email: string;
    password: string;
    businessName: string;
    businessType: string;
  }) {
    // Check if merchant exists
    const existingMerchant = await this.merchantRepo.findByEmail(data.email);
    if (existingMerchant) {
      throw new Error("Merchant already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate API key
    const apiKey = uuidv4().replace(/-/g, "");

    // Create merchant
    const merchant = await this.merchantRepo.create({
      id: uuidv4(),
      email: data.email,
      password_hash: passwordHash,
      business_name: data.businessName,
      business_type: data.businessType,
      status: "pending",
      kyc_status: "pending",
      api_key: apiKey,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: merchant.id,
      email: merchant.email,
      businessName: merchant.business_name,
      status: merchant.status,
      apiKey: merchant.api_key,
    };
  }

  async login(email: string, password: string) {
    const merchant = await this.merchantRepo.findByEmail(email);
    if (!merchant) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      merchant.password_hash
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (merchant.status === "suspended" || merchant.status === "deactivated") {
      throw new Error("Account is not active");
    }

    const token = jwt.sign(
      {
        id: merchant.id,
        email: merchant.email,
        merchantId: merchant.id,
        role: "merchant",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return {
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        businessName: merchant.business_name,
        status: merchant.status,
        kycStatus: merchant.kyc_status,
      },
    };
  }

  async refreshToken(merchantId: string) {
    const merchant = await this.merchantRepo.findById(merchantId);
    if (!merchant) {
      throw new Error("Merchant not found");
    }

    const token = jwt.sign(
      {
        id: merchant.id,
        email: merchant.email,
        merchantId: merchant.id,
        role: "merchant",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );
    return { token };
  }
}
