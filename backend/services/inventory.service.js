import InventoryModel from "../models/InventoryModel.js";
import { Types } from "mongoose";
import emailService from "./email.service.js";

class InventoryService {
  // CREATE
  async createItem(itemData) {
    try {
      const newItem = new InventoryModel(itemData);
      const savedItem = await newItem.save();
      return { success: true, data: savedItem };
    } catch (error) {
      if (error.code === 11000) {
        return {
          success: false,
          error: `Item code '${itemData.itemCode}' already exists`,
          code: "DUPLICATE_ITEM_CODE",
        };
      }
      return {
        success: false,
        error: error.message || "Failed to create inventory item",
        code: "CREATE_ERROR",
      };
    }
  }

  // READ - Get All
  async getAllItems(filters = {}) {
    try {
      const query = { isDeleted: false }; //  Ignore deleted items

      // Apply optional filters
      if (filters.search && typeof filters.search === "string") {
        const term = filters.search.trim();
        if (term.length > 0) {
          // Use case-insensitive partial match for all search terms
          const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          query.$or = [
            { itemName: rx },
            { itemCode: rx },
            { description: rx },
            { category: rx },
            { supplierEmail: rx },
          ];
        }
      }

      const items = await InventoryModel.find(query)
        .sort({ createdAt: -1 })
        .lean();
      for (var item of items) {
        try {
          if (item.inStockQuantity < 10) {
            emailService.sendOutOfStockEmail(item);
          }
        } catch (error) {
          console.error(error);
        }
      }
      return { success: true, data: items };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve inventory items",
        code: "FETCH_ERROR",
      };
    }
  }

  // READ - Get by ID
  async getItemById(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid inventory ID format",
          code: "INVALID_ID",
        };
      }

      const item = await InventoryModel.findOne({
        _id: id,
        isDeleted: false,
      }).lean(); // Soft delete check

      if (!item) {
        return {
          success: false,
          error: "Inventory item not found",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve inventory item",
        code: "FETCH_ERROR",
      };
    }
  }

  // UPDATE
  async updateItem(id, updateData) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid inventory ID format",
          code: "INVALID_ID",
        };
      }

      if (updateData.itemCode) {
        delete updateData.itemCode;
      }

      const updatedItem = await InventoryModel.findOneAndUpdate(
  { _id: id, isDeleted: false },
  updateData,
  { new: true, runValidators: true, lean: true }
);

// Send low stock email if quantity < 10
if (updatedItem.inStockQuantity < 10) {
  try {
    await emailService.sendOutOfStockEmail(updatedItem);
  } catch (err) {
    console.error("Failed to send low stock email on update:", err);
  }
}

return { success: true, data: updatedItem };

    } catch (error) {
      if (error.code === 11000) {
        return {
          success: false,
          error: "Item code already exists",
          code: "DUPLICATE_ITEM_CODE",
        };
      }
      return {
        success: false,
        error: error.message || "Failed to update inventory item",
        code: "UPDATE_ERROR",
      };
    }
  }

  // DELETE - Soft Delete
  async deleteItem(id) {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid inventory ID format",
          code: "INVALID_ID",
        };
      }

      const deletedItem = await InventoryModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true, lean: true }
      );

      if (!deletedItem) {
        return {
          success: false,
          error: "Inventory item not found or already deleted",
          code: "NOT_FOUND",
        };
      }

      return { success: true, data: { id: deletedItem._id } };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete inventory item",
        code: "DELETE_ERROR",
      };
    }
  }

  // SPECIALIZED QUERIES
  async getExpiredItems() {
    try {
      const now = new Date();
      const expiredItems = await InventoryModel.find({
        expireDate: { $lt: now },
        isDeleted: false, // ✅ Ignore deleted
      })
        .sort({ expireDate: 1 })
        .lean();

      return { success: true, data: expiredItems };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve expired items",
        code: "FETCH_EXPIRED_ERROR",
      };
    }
  }

  async getNonExpiredItems() {
    try {
      const now = new Date();
      const nonExpiredItems = await InventoryModel.find({
        $or: [
          { expireDate: { $gte: now } },
          { expireDate: { $exists: false } },
        ],
        isDeleted: false, //  Ignore deleted
      })
        .sort({ expireDate: -1 })
        .lean();

      return { success: true, data: nonExpiredItems };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve non-expired items",
        code: "FETCH_NON_EXPIRED_ERROR",
      };
    }
  }

  async getItemsBySupplier(supplierEmail) {
    try {
      if (!supplierEmail) {
        return {
          success: false,
          error: "Supplier email is required",
          code: "MISSING_SUPPLIER_EMAIL",
        };
      }

      const items = await InventoryModel.find({
        supplierEmail: supplierEmail.toLowerCase().trim(),
        isDeleted: false, //  Ignore deleted
      })
        .sort({ itemName: 1 })
        .lean();

      return { success: true, data: items };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve supplier items",
        code: "FETCH_SUPPLIER_ERROR",
      };
    }
  }

  async getLowStockItems(threshold = 10) {
    try {
      const lowStockItems = await InventoryModel.find({
        inStockQuantity: { $lt: threshold },
        isDeleted: false, //  Ignore deleted
      })
        .sort({ inStockQuantity: 1 })
        .lean();

      return { success: true, data: lowStockItems };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve low stock items",
        code: "FETCH_LOW_STOCK_ERROR",
      };
    }
  }
}

export default new InventoryService();
