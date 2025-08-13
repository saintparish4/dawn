export interface Transaction {
  id: string;
  payment_id: string;
  merchant_id: string;
  hash: string;
  network: "ethereum" | "polygon";
  block_number?: number;
  confirmation_count: number;
  gas_used?: string;
  gas_price?: string;
  amount: string;
  fee: string;
  status: "pending" | "confirmed" | "failed";
  created_at: Date;
  updated_at: Date;
}
