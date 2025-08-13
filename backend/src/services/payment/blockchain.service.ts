import { ethers } from "ethers";

export class BlockchainService {
  private ethereumProvider: ethers.JsonRpcProvider;
  private polygonProvider: ethers.JsonRpcProvider;

  constructor() {
    this.ethereumProvider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    this.polygonProvider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL
    );
  }

  async getTransaction(hash: string, network: "ethereum" | "polygon") {
    const provider =
      network === "ethereum" ? this.ethereumProvider : this.polygonProvider;
    return await provider.getTransaction(hash);
  }

  async getTransactionReceipt(hash: string, network: "ethereum" | "polygon") {
    const provider =
      network === "ethereum" ? this.ethereumProvider : this.polygonProvider;
    return await provider.getTransactionReceipt(hash);
  }

  async estimateGasFee(network: "ethereum" | "polygon") {
    const provider =
      network === "ethereum" ? this.ethereumProvider : this.polygonProvider;
    const feeData = await provider.getFeeData();
    return feeData;
  }

  async getCurrentBlockNumber(network: "ethereum" | "polygon") {
    const provider =
      network === "ethereum" ? this.ethereumProvider : this.polygonProvider;
    return await provider.getBlockNumber();
  }
}
