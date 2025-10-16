// inventory.controller.js
import inventoryService from "../services/inventory.service.js";

// Helper to handle responses
const handleServiceResponse = (res, serviceResult) => {
  if (serviceResult.success) {
    return res.status(200).json(serviceResult.data);
  }

  const statusMap = {
    INVALID_ID: 400,
    NOT_FOUND: 404,
    DUPLICATE_ITEM_CODE: 409,
    MISSING_SUPPLIER_EMAIL: 400,
  };

  const statusCode = statusMap[serviceResult.code] || 500;
  return res.status(statusCode).json({
    error: serviceResult.error,
    code: serviceResult.code,
  });
};

// CRUD Operations
export const createItem = async (req, res) => {
  const result = await inventoryService.createItem(req.body);
  handleServiceResponse(res, result);
};

export const getAllItems = async (req, res) => {
  const { search } = req.query;
  const result = await inventoryService.getAllItems({ search });
  handleServiceResponse(res, result);
};

export const getItemById = async (req, res) => {
  const result = await inventoryService.getItemById(req.params.id);
  handleServiceResponse(res, result);
};

export const updateItem = async (req, res) => {
  const result = await inventoryService.updateItem(req.params.id, req.body);
  handleServiceResponse(res, result);
};

export const deleteItem = async (req, res) => {
  const result = await inventoryService.deleteItem(req.params.id);
  handleServiceResponse(res, result);
};

// Specialized Queries
export const getExpiredItems = async (req, res) => {
  const result = await inventoryService.getExpiredItems();
  handleServiceResponse(res, result);
};

export const getNonExpiredItems = async (req, res) => {
  const result = await inventoryService.getNonExpiredItems();
  handleServiceResponse(res, result);
};

export const getItemsBySupplier = async (req, res) => {
  const { email } = req.query;
  const result = await inventoryService.getItemsBySupplier(email);
  handleServiceResponse(res, result);
};

export const getLowStockItems = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;
  const result = await inventoryService.getLowStockItems(threshold);
  handleServiceResponse(res, result);
};
