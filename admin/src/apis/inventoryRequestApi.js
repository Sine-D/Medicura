import axios from "axios";

const inventoryRequestApi = axios.create({
  baseURL: "http://localhost:4000/api/inventory-requests",
});

export const createInventoryRequest = (requestData) =>
  inventoryRequestApi.post("/", requestData);

export const getAllInventoryRequests = (status = "") =>
  inventoryRequestApi.get("/", { params: { status } });

export const getInventoryRequestById = (id) =>
  inventoryRequestApi.get(`/${id}`);

export const updateInventoryRequest = (id, requestData) =>
  inventoryRequestApi.put(`/${id}`, requestData);

export const deleteInventoryRequest = (id) =>
  inventoryRequestApi.delete(`/${id}`);
