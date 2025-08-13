export interface WebhookLog {
  id: string;
  merchant_id: string;
  event_type: string; // TODO: Add event types
  payload: any;
  response_status?: number;
  response_body?: any;
  attempts: number;
  max_attempts: number;
  next_retry?: Date;
  status: "pending" | "delivered" | "failed";
  created_at: Date;
  updated_at: Date;
}
