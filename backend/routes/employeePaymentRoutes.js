import express from 'express';
import employeePaymentController from '../controllers/employeePaymentController.js';

const router = express.Router();

// CRUD routes
router.post("/", employeePaymentController.createPayment);
router.get("/", employeePaymentController.getPayments);
router.get("/:id", employeePaymentController.getPaymentById);
router.put("/:id", employeePaymentController.updatePayment);
router.delete("/:id", employeePaymentController.deletePayment);

export default router;