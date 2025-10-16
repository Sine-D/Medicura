import Expense from '../models/Expense.js';

// Create new expense
export const createExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: "Error creating expense", error: error.message });
  }
};

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};

// Get single expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error: error.message });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: "Error updating expense", error: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};

// Update expense payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentId, status, amount } = req.body;
    const expenseId = orderId.replace('EXP', '');
    
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.paymentStatus = status;
    expense.paymentOrderId = orderId;
    expense.paymentId = paymentId;
    expense.paymentAmount = amount;
    
    if (status === 'paid') {
      expense.paymentDate = new Date();
      expense.paymentMethod = 'online';
    }

    await expense.save();
    res.status(200).json({ message: "Payment status updated successfully", expense });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status", error: error.message });
  }
};

export default {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  updatePaymentStatus
};