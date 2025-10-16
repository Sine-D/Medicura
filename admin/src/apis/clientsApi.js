import axios from "axios";

const clientsApi = axios.create({
  baseURL: "http://localhost:4000/api/clients",
});

export const getAllClients = (search = "") =>
  clientsApi.get("/", { params: { search } });

export const createClient = (data) => clientsApi.post("/", data);

export const updateClient = (id, data) => clientsApi.put(`/${id}`, data);

export const deleteClient = (id) => clientsApi.delete(`/${id}`);

export default clientsApi;


