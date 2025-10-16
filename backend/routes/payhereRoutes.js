import express from 'express';
import payhereController from '../controllers/payhereController.js';

const router = express.Router();

// Create payment order
router.post("/order", payhereController.createOrder);

// Payment notification (IPN)
router.post("/notify", payhereController.handleNotification);

// Verify payment status
router.get("/verify/:order_id", payhereController.verifyPayment);

export default router;