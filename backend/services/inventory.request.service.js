import InventoryRequestModel from "../models/InventoryRequest.js";
import { Types } from "mongoose";

class InventoryRequestService {
  // CREATE
  async createRequest(requestData) {
    try {
      const newRequest = new InventoryRequestModel(requestData);
      const savedRequest = await newRequest.save();
      return { success: true, data: savedRequest };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create inventory request",
        code: "CREATE_ERROR",
      };
    }
  }

  // READ - Get All
  async getAllRequests(filters = {}) {
    try {
      const query = { isDeleted: false };

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const requests = await InventoryRequestModel.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, data: requests };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve inventory requests",
        code: "FETCH_ERROR",
      };
    }
  }

  // READ - Get by ID
  async getRequestById(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const request = await InventoryRequestModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean();

      if (!request) {
        return {
          success: false,
          error: "Inventory request not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: request };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve inventory request",
        code: "FETCH_ERROR",
      };
    }
  }

  // UPDATE
  async updateRequest(id, updateData) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const updatedRequest = await InventoryRequestModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        updateData,
        {
          new: true,
          runValidators: true,
          lean: true,
        }
      );

      if (!updatedRequest) {
        return {
          success: false,
          error: "Inventory request not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: updatedRequest };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update inventory request",
        code: "UPDATE_ERROR",
      };
    }
  }

  // DELETE - Soft Delete
  async deleteRequest(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const deletedRequest = await InventoryRequestModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true, lean: true }
      );

      if (!deletedRequest) {
        return {
          success: false,
          error: "Inventory request not found or already deleted",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: { id: deletedRequest._id } };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete inventory request",
        code: "DELETE_ERROR",
      };
    }
  }

  // SPECIALIZED QUERIES
  async getRequestsByStatus(status) {
    try {
      const requests = await InventoryRequestModel.find({
        status,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, data: requests };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve requests by status",
        code: "FETCH_STATUS_ERROR",
      };
    }
  }

  async getRequestsByMedicine(medicineName) {
    try {
      const requests = await InventoryRequestModel.find({
        "medicines.medicineName": new RegExp(medicineName, "i"),
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, data: requests };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve requests by medicine",
        code: "FETCH_MEDICINE_ERROR",
      };
    }
  }

  // NEW METHODS FOR MEDICINE MANAGEMENT
  async addMedicineToRequest(requestId, medicineData) {
    try {
      if (!Types.ObjectId.isValid(requestId)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const updatedRequest = await InventoryRequestModel.findOneAndUpdate(
        { _id: requestId, isDeleted: false },
        { $push: { medicines: medicineData } },
        { new: true, runValidators: true, lean: true }
      );

      if (!updatedRequest) {
        return {
          success: false,
          error: "Inventory request not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: updatedRequest };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add medicine to request",
        code: "ADD_MEDICINE_ERROR",
      };
    }
  }

  async removeMedicineFromRequest(requestId, medicineIndex) {
    try {
      if (!Types.ObjectId.isValid(requestId)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const request = await InventoryRequestModel.findOne({
        _id: requestId,
        isDeleted: false,
      });

      if (!request) {
        return {
          success: false,
          error: "Inventory request not found",
          code: "NOT_FOUND",
        };
      }

      if (request.medicines.length <= 1) {
        return {
          success: false,
          error: "Cannot remove the last medicine from request",
          code: "VALIDATION_ERROR",
        };
      }

      if (medicineIndex >= request.medicines.length) {
        return {
          success: false,
          error: "Medicine index out of bounds",
          code: "INVALID_INDEX",
        };
      }

      request.medicines.splice(medicineIndex, 1);
      const savedRequest = await request.save();

      return { success: true, data: savedRequest };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to remove medicine from request",
        code: "REMOVE_MEDICINE_ERROR",
      };
    }
  }

  async updateMedicineInRequest(requestId, medicineIndex, medicineData) {
    try {
      if (!Types.ObjectId.isValid(requestId)) {
        return {
          success: false,
          error: "Invalid request ID format",
          code: "INVALID_ID",
        };
      }

      const updateObject = {};
      Object.keys(medicineData).forEach((key) => {
        updateObject[`medicines.${medicineIndex}.${key}`] = medicineData[key];
      });

      const updatedRequest = await InventoryRequestModel.findOneAndUpdate(
        { _id: requestId, isDeleted: false },
        { $set: updateObject },
        { new: true, runValidators: true, lean: true }
      );

      if (!updatedRequest) {
        return {
          success: false,
          error: "Inventory request not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: updatedRequest };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update medicine in request",
        code: "UPDATE_MEDICINE_ERROR",
      };
    }
  }
}

export default new InventoryRequestService();
