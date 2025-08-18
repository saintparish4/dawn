export const paymentFixtures = {
    validPayment: {
        id: "123e4567-e89b-12d3-a456-426614174003",
        merchant_id: "123e4567-e89b-12d3-a456-426614174000",
        amount: 100.00,
        currency: "USDc",
        status: "pending",
        payment_url: "https://pay.dawn.com/pay/123e4567-e89b-12d3-a456-426614174003",
        qr_code: "data:iamge/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        network: "ethereum",
        merchant_reference: "ORDER-12345", 
    },

    completedPayment: {
        id: "123e4567-e89b-12d3-a456-426614174004",
        merchant_id: "123e4567-e89b-12d3-a456-426614174000",
        amount: "250.00",
        currency: "USDC",
        status: "completed",
        payment_url: "https://pay.dawn.com/pay/123e4567-e89b-12d3-a456-426614174004",
        qr_code: "data:iamge/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        customer_wallet: "0x1234567890abcdef1234567890abcdef12345678",
        transaction_hash: "0x1234567890abcdef1234567890abcdef12345678",
        network: "ethereum" 
    }
};