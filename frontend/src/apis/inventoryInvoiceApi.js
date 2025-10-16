import axios from "axios";

const inventoryInvoiceApi = axios.create({
  baseURL: "http://localhost:4000/api/inventory-invoices",
});

export const createInventoryInvoice = (invoiceData) =>
  inventoryInvoiceApi.post("/", invoiceData);

export const getAllInventoryInvoices = (status = "") =>
  inventoryInvoiceApi.get("/");

export const getInventoryInvoiceById = (id) =>
  inventoryInvoiceApi.get(`/${id}`);

export const updateInventoryInvoice = (id, invoiceData) =>
  inventoryInvoiceApi.put(`/${id}`, invoiceData);

export const deleteInventoryInvoice = (id) =>
  inventoryInvoiceApi.delete(`/${id}`);
