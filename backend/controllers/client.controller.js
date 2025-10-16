import clientService from "../services/client.service.js";

const handleServiceResponse = (res, result) => {
  if (result.success) return res.status(200).json(result.data);
  const statusMap = {
    INVALID_ID: 400,
    NOT_FOUND: 404,
  };
  return res.status(statusMap[result.code] || 500).json({ error: result.error, code: result.code });
};

const createClient = async (req, res) => {
  const result = await clientService.createClient(req.body);
  handleServiceResponse(res, result);
};

const getAllClients = async (req, res) => {
  const { search } = req.query;
  const result = await clientService.getAllClients({ search });
  handleServiceResponse(res, result);
};

const getClientById = async (req, res) => {
  const result = await clientService.getClientById(req.params.id);
  handleServiceResponse(res, result);
};

const updateClient = async (req, res) => {
  const result = await clientService.updateClient(req.params.id, req.body);
  handleServiceResponse(res, result);
};

const deleteClient = async (req, res) => {
  const result = await clientService.deleteClient(req.params.id);
  handleServiceResponse(res, result);
};

export default {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
};


