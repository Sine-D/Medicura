import axios from "axios";

const inventoryApi = axios.create({
  baseURL: "http://localhost:4000/api/inventory",
});

export const createInventoryItem = (itemData) =>
  inventoryApi.post("/", itemData);

export const getAllInventoryItems = (search = "") =>
  inventoryApi.get("/", { params: { search } });

export const getInventoryItemById = (id) => inventoryApi.get(`/${id}`);

export const updateInventoryItem = (id, itemData) =>
  inventoryApi.put(`/${id}`, itemData);

export const deleteInventoryItem = (id) => inventoryApi.delete(`/${id}`);

export const getExpiredItems = () => inventoryApi.get("/expired");

export const getNonExpiredItems = () => inventoryApi.get("/non-expired");

export const getItemsBySupplier = (email) =>
  inventoryApi.get("/supplier", { params: { email } });

export const getLowStockItems = (threshold = 10) =>
  inventoryApi.get("/low-stock", { params: { threshold } });
