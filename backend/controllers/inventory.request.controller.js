import inventoryRequestService from "../services/inventory.request.service.js";

const handleServiceResponse = (res, serviceResult) => {
  if (serviceResult.success) {
    return res.status(200).json(serviceResult.data);
  }

  const statusMap = {
    INVALID_ID: 400,
    NOT_FOUND: 404,
  };

  const statusCode = statusMap[serviceResult.code] || 500;
  return res.status(statusCode).json({
    error: serviceResult.error,
    code: serviceResult.code,
  });
};

// CRUD Operations
export const createRequest = async (req, res) => {
  const result = await inventoryRequestService.createRequest(req.body);
  handleServiceResponse(res, result);
};

export const getAllRequests = async (req, res) => {
  const { search, status } = req.query;
  const result = await inventoryRequestService.getAllRequests({ search, status });
  handleServiceResponse(res, result);
};

export const getRequestById = async (req, res) => {
  const result = await inventoryRequestService.getRequestById(req.params.id);
  handleServiceResponse(res, result);
};

export const updateRequest = async (req, res) => {
  const result = await inventoryRequestService.updateRequest(req.params.id, req.body);
  handleServiceResponse(res, result);
};

export const deleteRequest = async (req, res) => {
  const result = await inventoryRequestService.deleteRequest(req.params.id);
  handleServiceResponse(res, result);
};

// Specialized Queries
export const getRequestsByStatus = async (req, res) => {
  const { status } = req.query;
  if (!status) {
    return res.status(400).json({ error: "Status is required", code: "MISSING_STATUS" });
  }
  const result = await inventoryRequestService.getRequestsByStatus(status);
  handleServiceResponse(res, result);
};

export const getRequestsByMedicine = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Medicine name is required", code: "MISSING_MEDICINE_NAME" });
  }
  const result = await inventoryRequestService.getRequestsByMedicine(name);
  handleServiceResponse(res, result);
};
