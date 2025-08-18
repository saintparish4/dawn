export const merchantFixtures = {
    validMerchant: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "john@testbusiness.com",
        password: "SecurePassword123!",
        business_name: "Test Business LLC",
        business_type: "ecommerce",
        status: "active",
        kyc_status: "verified",
        api_key: "test-api-key-12345",
        wallet_address: "0x1234567890abcdef1234567890abcdef12345678",
        settlement_address: "0x1234567890abcdef1234567890abcdef12345678" 
    },

    pendingMerchant: {
        id: "123e4567-e89b-12d3-a456-426614174001",
        email: "pending@testbusiness.com",
        password: "PendingPassword123!",
        business_name: "Pending Business LLC",
        business_type: "ecommerce",
        status: "pending",
        kyc_status: "pending",
        api_key: "pending-api-key-12345", 
    },

    suspendedMerchant: {
        id: "123e4567-e89b-12d3-a456-426614174002",
        email: "suspended@testbusiness.com",
        password: "SuspendedPassword123!",
        business_name: "Suspended Business LLC",
        business_type: "ecommerce",
        status: "suspended",
        kyc_status: "verified",
        api_key: "suspended-api-key-12345", 
    }
};