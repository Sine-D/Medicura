// ========================================
// 2. routes/expenseRoutes.js
// ========================================
import express from 'express';
import expenseController from '../controllers/expenseController.js';

const router = express.Router();

// Create expense
router.post("/", expenseController.createExpense);

// Get all expenses
router.get("/", expenseController.getExpenses);

// Get single expense by ID
router.get("/:id", expenseController.getExpenseById);

// Update expense
router.put("/:id", expenseController.updateExpense);

// Delete expense
router.delete("/:id", expenseController.deleteExpense);

// Update payment status (called from PayHere webhook)
router.post("/payment/update", expenseController.updatePaymentStatus);

export default router;