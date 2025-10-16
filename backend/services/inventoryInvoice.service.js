import InventoryInvoiceModel from "../models/InventoryInvoice.js";
import { Types } from "mongoose";

class InventoryInvoiceService {
  // CREATE
  async createInvoice(invoiceData) {
    try {
      const newInvoice = new InventoryInvoiceModel(invoiceData);
      const savedInvoice = await newInvoice.save();
      return { success: true, data: savedInvoice };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create invoice",
        code: "CREATE_ERROR",
      };
    }
  }

  // READ - All
  async getAllInvoices(filters = {}) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      const invoices = await InventoryInvoiceModel.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return { success: true, data: invoices };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch invoices",
        code: "FETCH_ERROR",
      };
    }
  }

  // READ - By ID
  async getInvoiceById(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid invoice ID format",
          code: "INVALID_ID",
        };
      }

      const invoice = await InventoryInvoiceModel.findById(id).lean();

      if (!invoice) {
        return {
          success: false,
          error: "Invoice not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: invoice };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch invoice",
        code: "FETCH_ERROR",
      };
    }
  }

  // UPDATE
  async updateInvoice(id, updateData) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid invoice ID format",
          code: "INVALID_ID",
        };
      }

      const updatedInvoice = await InventoryInvoiceModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true, lean: true }
      );

      if (!updatedInvoice) {
        return {
          success: false,
          error: "Invoice not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: updatedInvoice };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update invoice",
        code: "UPDATE_ERROR",
      };
    }
  }

  // DELETE
  async deleteInvoice(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid invoice ID format",
          code: "INVALID_ID",
        };
      }

      const deletedInvoice = await InventoryInvoiceModel.findByIdAndDelete(
        id
      ).lean();

      if (!deletedInvoice) {
        return {
          success: false,
          error: "Invoice not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: { id: deletedInvoice._id } };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete invoice",
        code: "DELETE_ERROR",
      };
    }
  }
}

export default new InventoryInvoiceService();
