import { Router } from "express";
import { MerchantController } from "../controllers/merchant.controller";
import { MerchantService } from "../services/merchant/merchant.service";
import { MerchantRepository } from "../repositories/merchant.repository";
import { validate } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { apiRateLimiter } from "../middleware/rate-limit.middleware";
import { merchantSchemas } from "../utils/validation";
import { db } from "../database/connection";

const router = Router();

// Initialize dependencies
const merchantRepo = new MerchantRepository(db);
const merchantService = new MerchantService(merchantRepo);
const merchantController = new MerchantController(merchantService);

// All merchant routes require authentication
router.use(authMiddleware);
router.use(apiRateLimiter);

// Merchant management routes
router.get('/profile', merchantController.getProfile);
router.patch('/profile', validate(merchantSchemas.updateProfile), merchantController.updateProfile);
router.post('/webhook', validate(merchantSchemas.webhookSettings), merchantController.updateWebhookSettings);
router.post('/regenerate-api-key', merchantController.regenerateApiKey);

export { router as merchantRoutes };