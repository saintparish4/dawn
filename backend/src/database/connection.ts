import { Pool } from "pg";

export const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "dawn",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle connection events
db.on("connect", () => {
  console.log("Connected to the database");
});

db.on("error", (err) => {
  console.error("Database connection error:", err);
  process.exit(-1);
});
