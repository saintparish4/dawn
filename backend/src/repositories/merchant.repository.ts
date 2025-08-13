import { BaseRepository } from "./base.repository";
import { Merchant } from "../models/merchant.model";

export class MerchantRepository extends BaseRepository {
  async create(merchant: Partial<Merchant>): Promise<Merchant> {
    const query = `
            INSERT INTO merchants (
            id, email, password_hash, business_name, business_type, status, kyc_status, wallet_address, settlement_address, api_key, webhook_url, webhook_secret, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

    const values = [
      merchant.id,
      merchant.email,
      merchant.password_hash,
      merchant.business_name,
      merchant.business_type,
      merchant.status,
      merchant.kyc_status,
      merchant.api_key,
      merchant.created_at,
      merchant.updated_at,
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  async findById(id: string): Promise<Merchant | null> {
    const query = "SELECT * FROM merchants WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<Merchant | null> {
    const query = "SELECT * FROM merchants WHERE email = $1";
    const result = await this.query(query, [email]);
    return result.rows[0] || null;
  }

  async findByApiKey(apiKey: string): Promise<Merchant | null> {
    const query = "SELECT * FROM merchants WHERE api_key = $1";
    const result = await this.query(query, [apiKey]);
    return result.rows[0] || null;
  }

  async update(id: string, data: Partial<Merchant>): Promise<Merchant> {
    const fields = Object.keys(data).filter((key) => data[key as keyof Merchant] !== undefined);
    const values = fields.map((field) => data[field as keyof Merchant]);
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    const query = `
            UPDATE merchants
            SET ${setClause}, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;

    const result = await this.query(query, [id, ...values]);
    return result.rows[0];
  }

  async findAll(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const countQuery = "SELECT COUNT(*) FROM merchants";
    const countResult = await this.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    const query = `
            SELECT * FROM merchants
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2 
        `;

    const result = await this.query(query, [limit, offset]);

    return {
      merchants: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
