export const mockBlockchainService = {
    getTransaction: jest.fn(),
    getTransactionReceipt: jest.fn(),
    estimateGasFee: jest.fn(),
    getCurrentBlockNumber: jest.fn(), 
};

// Mock successful transaction
mockBlockchainService.getTransaction.mockResolvedValue({
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    from: "0x1234567890abcdef1234567890abcdef12345678",
    to: "0x1234567890abcdef1234567890abcdef12345678",
    value: "100500000", // 100.5 USDC (6 decimals)
    blockNumber: 18500000,
    confirmations: 12 
});

mockBlockchainService.getTransactionReceipt.mockResolvedValue({
    status: 1,
    gasUsed: "21000",
    blockNumber: 18500000, 
});

mockBlockchainService.estimateGasFee.mockResolvedValue('20000000000'); // 20 Gwei
mockBlockchainService.getCurrentBlockNumber.mockResolvedValue(18500000);