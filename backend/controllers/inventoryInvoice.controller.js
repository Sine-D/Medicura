import inventoryInvoiceService from "../services/inventoryInvoice.service.js";

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

// CRUD
export const createInvoice = async (req, res) => {
  const result = await inventoryInvoiceService.createInvoice(req.body);
  handleServiceResponse(res, result);
};

export const getAllInvoices = async (req, res) => {
  const { status } = req.query;
  const result = await inventoryInvoiceService.getAllInvoices({ status });
  handleServiceResponse(res, result);
};

export const getInvoiceById = async (req, res) => {
  const result = await inventoryInvoiceService.getInvoiceById(req.params.id);
  handleServiceResponse(res, result);
};

export const updateInvoice = async (req, res) => {
  const result = await inventoryInvoiceService.updateInvoice(
    req.params.id,
    req.body
  );
  handleServiceResponse(res, result);
};

export const deleteInvoice = async (req, res) => {
  const result = await inventoryInvoiceService.deleteInvoice(req.params.id);
  handleServiceResponse(res, result);
};
