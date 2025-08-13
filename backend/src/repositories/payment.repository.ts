import { BaseRepository } from "./base.repository";
import { Payment } from "../models/payment.model";

export class PaymentRepository extends BaseRepository {
  async create(payment: Partial<Payment>): Promise<Payment> {
    const query = `
            INSERT INTO payments (
            id, merchant_id, amount, currency, status, payment_url,
            qr_code, expires_at, network, merchant_reference, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

    const values = [
      payment.id,
      payment.merchant_id,
      payment.amount,
      payment.currency,
      payment.status,
      payment.payment_url,
      payment.qr_code,
      payment.expires_at,
      payment.network,
      payment.merchant_reference,
      payment.created_at,
      payment.updated_at,
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Payment | null> {
    const query = "SELECT * FROM payments WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateStatus(
    id: string,
    status: string,
    transactionHash?: string
  ): Promise<Payment> {
    const query = `
            UPDATE payments
            SET status = $2, transaction_hash = $3, updated_at = NOW()
            WHERE id = $1
            RETURNING * 
        `;

    const result = await this.query(query, [id, status, transactionHash]);
    return result.rows[0];
  }

  async findByMerchant(
    merchantId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM payments WHERE merchant_id = $1";
    const countResult = await this.query(countQuery, [merchantId]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
            SELECT * FROM payments
            WHERE merchant_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;

    const result = await this.query(query, [merchantId, limit, offset]);

    return {
      payments: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findExpiredPayments(): Promise<Payment[]> {
    const query = `
        SELECT * FROM payments
        WHERE status = 'pending' AND expires_at < NOW() 
    `;

    const result = await this.query(query);
    return result.rows;
  }
}
