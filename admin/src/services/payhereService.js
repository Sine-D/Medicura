import axios from "axios";

const API_URL = "http://localhost:4000/api/payhere";

// Create PayHere payment order
export const createPayHereOrder = (orderData) => axios.post(`${API_URL}/order`, orderData);

// Verify payment status
export const verifyPayment = (orderId) => axios.get(`${API_URL}/verify/${orderId}`);

// Alternative: Use the main payment endpoint
export const createMainPayHereOrder = (orderData) => 
  axios.post("http://localhost:4000/api/payhere/order", orderData);