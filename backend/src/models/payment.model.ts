export interface Payment {
  id: string;
  merchant_id: string;
  amount: string; // Using string for precise decimal handling
  currency: "USDC";
  status:
    | "pending"
    | "confirming"
    | "completed"
    | "failed"
    | "expired"
    | "refunded";
  payment_url: string;
  qr_code: string;
  expires_at: Date;
  customer_wallet?: string;
  transaction_hash?: string;
  network: "ethereum" | "polygon";
  gas_fee?: string;
  merchant_reference?: string;
  created_at: Date;
  updated_at: Date;
}
