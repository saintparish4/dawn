import { describe, expect, it, beforeEach } from "@jest/globals";
import { BlockchainService } from "../../../src/services/payment/blockchain.service";

describe("Blockchain Integration Tests", () => {
  let blockchainService: BlockchainService;

  beforeEach(() => {
    blockchainService = new BlockchainService();
  });

  describe("Ethereum Network", () => {
    it("should get current block number", async () => {
      // Act
      const blockNumber = await blockchainService.getCurrentBlockNumber(
        "ethereum"
      );

      // Assert
      expect(typeof blockNumber).toBe("number");
      expect(blockNumber).toBeGreaterThan(18000000); // Should be well past this block
    });

    it("should estimate gas fees", async () => {
      // Act
      const gasPrice = await blockchainService.estimateGasFee("ethereum");

      // Assert
      expect(gasPrice).toBeDefined();
      expect(gasPrice.toString()).toMatch(/^\d+$/); // Should be a number as string
    });

    it("should handle network errors gracefully", async () => {
      // Arrange - Create service with invalid RPC URL
      const invalidService = new BlockchainService();
      process.env.ETHEREUM_RPC_URL = "https://invalid-rpc-url.com";

      // ACT + Assert
      await expect(
        invalidService.getCurrentBlockNumber("ethereum")
      ).rejects.toThrow();
    });
  });

  describe("Polygon Network", () => {
    it("should get current block number from Polygon", async () => {
      // Act
      const blockNumber = await blockchainService.getCurrentBlockNumber(
        "polygon"
      );

      // Assert
      expect(typeof blockNumber).toBe("number");
      expect(blockNumber).toBeGreaterThan(40000000); // Polygon has higher block numbers
    });

    it("should estimate gas fees on Polygon", async () => {
      // Act
      const gasPrice = await blockchainService.estimateGasFee("polygon");

      // Assert
      expect(gasPrice).toBeDefined();
      expect(gasPrice.toString()).toMatch(/^\d+$/); // Should be a number as string
    });
  });

  describe("Transaction Monitoring", () => {
    it("should validate transaction hash format", () => {
      // Arrange
      const validHash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const invalidHash = "invalid-hash";

      // Act + Assert
      expect(validHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(invalidHash).not.toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it("should handle transaction retrieval errors", async () => {
      // Arrange
      const nonExistentHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      // Act + Assert
      await expect(
        blockchainService.getTransaction(nonExistentHash, "ethereum")
      ).resolves.toBeNull(); // Non-existent transaction should return null
    });
  });
});
