import axios from "axios";

const API_URL = "http://localhost:4000/api/expenses";

// Fetch all expenses
export const getExpenses = () => axios.get(API_URL);

// Fetch one expense by ID
export const getExpenseById = (id) => axios.get(`${API_URL}/${id}`);

// Create new expense
export const createExpense = (expenseData) => axios.post(API_URL, expenseData);

// Update an expense
export const updateExpense = (id, expenseData) => axios.put(`${API_URL}/${id}`, expenseData);

// Delete an expense
export const deleteExpense = (id) => axios.delete(`${API_URL}/${id}`);

// Update payment status
export const updatePaymentStatus = (paymentData) => 
  axios.post(`${API_URL}/payment/update`, paymentData);