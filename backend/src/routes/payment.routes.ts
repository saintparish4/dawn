import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentService } from "../services/payment/payment.service";
import { BlockchainService } from "../services/payment/blockchain.service";
import { PaymentRepository } from "../repositories/payment.repository";
import { validate } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { apiRateLimiter } from "../middleware/rate-limit.middleware";
import { paymentSchemas } from "../utils/validation";
import { db } from "../database/connection";

const router = Router();

// Initialize dependencies
const paymentRepo = new PaymentRepository(db);
const blockchainService = new BlockchainService();
const paymentService = new PaymentService(paymentRepo, blockchainService);
const paymentController = new PaymentController(paymentService);

// All payment routes require authentication
router.use(authMiddleware);
router.use(apiRateLimiter);

// Payment management routes
router.post('/', validate(paymentSchemas.create), paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/:paymentId', paymentController.getPayment);
router.patch('/:paymentId', validate(paymentSchemas.updateStatus), paymentController.updatePaymentStatus);

export { router as paymentRoutes };