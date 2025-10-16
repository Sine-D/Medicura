import axios from "axios";

const API_URL = "http://localhost:4000/api/employee-payments";

export const getEmployeePayments = () => axios.get(API_URL);
export const createEmployeePayment = (payment) => axios.post(API_URL, payment);
export const updateEmployeePayment = (id, payment) =>
  axios.put(`${API_URL}/${id}`, payment);
export const deleteEmployeePayment = (id) => axios.delete(`${API_URL}/${id}`);
