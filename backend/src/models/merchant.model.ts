export interface Merchant {
  id: string;
  email: string;
  password_hash: string;
  business_name: string;
  business_type: string;
  status: "pending" | "active" | "suspended" | "deactivated";
  kyc_status: "pending" | "verified" | "rejected";
  wallet_address?: string;
  settlement_address?: string;
  api_key: string;
  webhook_url?: string;
  webhook_secret?: string;
  created_at: Date;
  updated_at: Date;
}

// Add more merchant models here later
