import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { paymentRoutes } from "./payment.routes";
import { merchantRoutes } from "./merchant.routes";
import { transactionRoutes } from "./transaction.routes";
import { webhookRoutes } from "./webhook.routes";
import { systemRoutes } from "./system.routes";

const router = Router();

// API VERSION PREFiX
const API_VERSION = "/api/v1";

// Mount all routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/merchants`, merchantRoutes);
router.use(`${API_VERSION}/transactions`, transactionRoutes);
router.use(`${API_VERSION}/webhooks`, webhookRoutes);
router.use(`${API_VERSION}/system`, systemRoutes);

// Default route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dawn API v1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: `${API_VERSION}/auth`,
      payments: `${API_VERSION}/payments`,
      merchants: `${API_VERSION}/merchants`,
      transactions: `${API_VERSION}/transactions`,
      webhooks: `${API_VERSION}/webhooks`,
      system: `${API_VERSION}/system`,
    },
  });
});

export { router as apiRoutes };
