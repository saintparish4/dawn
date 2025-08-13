import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth/auth.service";
import { MerchantRepository } from "../repositories/merchant.repository";
import { validate } from "../middleware/validation.middleware";
import { authRateLimiter } from "../middleware/rate-limit.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { authSchemas } from "../utils/validation";
import { db } from "../database/connection";

const router = Router();

// Initialize dependencies
const merchantRepo = new MerchantRepository(db);
const authService = new AuthService(merchantRepo);
const authController = new AuthController(authService);

// Public routes
router.post('/register', authRateLimiter, validate(authSchemas.register), authController.register);
router.post('/login', authRateLimiter, validate(authSchemas.login), authController.login);


// Protected routes
router.post('/refresh', authMiddleware, authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

export { router as authRoutes };