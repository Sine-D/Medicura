import Client from "../models/Client.js";
import { Types } from "mongoose";

class ClientService {
  async createClient(payload) {
    try {
      const now = new Date();
      const client = new Client({
        ...payload,
        totalOrders: payload.totalOrders ?? 0,
        lastOrderDate: payload.lastOrderDate ?? null,
        rating: payload.rating ?? 0,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      });
      const saved = await client.save();
      return { success: true, data: saved };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create client",
        code: "CREATE_ERROR",
      };
    }
  }

  async getAllClients(filters = {}) {
    try {
      const query = { isDeleted: false };
      if (filters.search) {
        const term = String(filters.search).trim();
        if (term.length > 0) {
          const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          query.$or = [
            { name: rx },
            { email: rx },
            { phone: rx },
            { clientType: rx },
            { address: rx },
          ];
        }
      }
      const clients = await Client.find(query).sort({ createdAt: -1 }).lean();
      return { success: true, data: clients };
    } catch (error) {
      return { success: false, error: "Failed to retrieve clients", code: "FETCH_ERROR" };
    }
  }

  async getClientById(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid client ID format", code: "INVALID_ID" };
      }
      const client = await Client.findOne({ _id: id, isDeleted: false }).lean();
      if (!client) {
        return { success: false, error: "Client not found", code: "NOT_FOUND" };
      }
      return { success: true, data: client };
    } catch (error) {
      return { success: false, error: "Failed to retrieve client", code: "FETCH_ERROR" };
    }
  }

  async updateClient(id, updateData) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid client ID format", code: "INVALID_ID" };
      }
      const updated = await Client.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        { new: true, runValidators: true, lean: true }
      );
      if (!updated) {
        return { success: false, error: "Client not found", code: "NOT_FOUND" };
      }
      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error.message || "Failed to update client", code: "UPDATE_ERROR" };
    }
  }

  async deleteClient(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return { success: false, error: "Invalid client ID format", code: "INVALID_ID" };
      }
      const deleted = await Client.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true, lean: true }
      );
      if (!deleted) {
        return { success: false, error: "Client not found or already deleted", code: "NOT_FOUND" };
      }
      return { success: true, data: { id: deleted._id } };
    } catch (error) {
      return { success: false, error: "Failed to delete client", code: "DELETE_ERROR" };
    }
  }
}

export default new ClientService();


