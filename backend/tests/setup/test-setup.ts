import { beforeAll, afterAll, beforeEach } from "@jest/globals";
import { Pool } from "pg";


// Test database configuration
export const testDb = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost', // <- Environment variable ready
  port: parseInt(process.env.TEST_DB_PORT || '5433'), // <- Configurable port for testing
  database: process.env.TEST_DB_NAME || 'dawn_test',
  user: process.env.TEST_DB_USER || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test', 
});



// Global test setup
beforeAll(async () => {
  // Set test environment
  Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
  process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
  process.env.ETHEREUM_RPC_URL = "https://eth-mainnet.alchemyapi.io/v2/test";
  process.env.POLYGON_RPC_URL = "https://polygon-mainnet.g.alchemy.com/v2/test";

  // Initialize test database schema
  await initializeTestDatabase();
});

// Global test teardown
afterAll(async () => {
  await testDb.end();
});

// Reset database state between tests
beforeEach(async () => {
  await cleanDatabase();
});

async function initializeTestDatabase() {
  // Create test tables
  await testDb.query(`
        CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        kyc_status VARCHAR(50) DEFAULT 'pending',
        wallet_address VARCHAR(42),
        settlement_address VARCHAR(42),
        api_key VARCHAR(255) UNIQUE NOT NULL,
        webhook_url TEXT,
        webhook_secret VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);

  await testDb.query(`
        CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY,
        merchant_id UUID REFERENCES merchants(id),
        amount DECIMAL(18, 6) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USDC',
        status VARCHAR(50) DEFAULT 'pending',
        payment_url TEXT NOT NULL,
        qr_code TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        customer_wallet VARCHAR(42),
        transaction_hash VARCHAR(66),
        network VARCHAR(20) DEFAULT 'ethereum',
        gas_fee DECIMAL(18, 6),
        merchant_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);

  await testDb.query(`
        CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        payment_id UUID REFERENCES payments(id),
        merchant_id UUID REFERENCES merchants(id),
        hash VARCHAR(66) UNIQUE NOT NULL,
        network VARCHAR(20) NOT NULL,
        block_number BIGINT,
        confirmation_count INTEGER DEFAULT 0,
        gas_used DECIMAL(18, 6),
        gas_price DECIMAL(18, 6),
        amount DECIMAL(18, 6) NOT NULL,
        fee DECIMAL(18, 6) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);

  await testDb.query(`
        CREATE TABLE IF NOT EXISTS webhook_logs (
        id UUID PRIMARY KEY,
        merchant_id UUID REFERENCES merchants(id),
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        response_status INTEGER,
        response_body TEXT,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        next_retry TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
}

async function cleanDatabase() {
    await testDb.query(`TRUNCATE webhook_logs, transactions, payments, merchants CASCADE;`);
}
