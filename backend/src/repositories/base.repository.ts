import { Pool } from "pg";

export abstract class BaseRepository {
  constructor(protected db: Pool) {}

  protected async query(text: string, params?: any[]) {
    const start = Date.now();
    const result = await this.db.query(text, params);
    const duration = Date.now() - start;

    console.log("Executed query", { text, duration, rows: result.rowCount });
    return result;
  }
}
