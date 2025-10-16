import Cart from "../models/CartModel.js";
import Inventory from "../models/InventoryModel.js";
import { Types } from "mongoose";

class CartService {
  // Get or create cart for user
  async getOrCreateCart(userEmail) {
    try {
      let cart = await Cart.findOne({ userEmail }).populate("items.inventoryItem");
      if (!cart) {
        cart = await Cart.create({ userEmail, items: [], total: 0 });
      }
      return { success: true, cart };
    } catch (error) {
      return {
        success: false,
        error: "Failed to retrieve/create cart",
        code: "CART_FETCH_ERROR",
      };
    }
  }

  // Add item to cart
  async addItemToCart(userEmail, inventoryItemId, quantity = 1) {
    try {
      if (!Types.ObjectId.isValid(inventoryItemId)) {
        return {
          success: false,
          error: "Invalid inventory item ID",
          code: "INVALID_INVENTORY_ID",
        };
      }

      const inventoryItem = await Inventory.findById(inventoryItemId);
      if (!inventoryItem) {
        return {
          success: false,
          error: "Inventory item not found",
          code: "INVENTORY_NOT_FOUND",
        };
      }

      if (inventoryItem.inStockQuantity < quantity) {
        return {
          success: false,
          error: `Only ${inventoryItem.inStockQuantity} units available`,
          code: "INSUFFICIENT_STOCK",
        };
      }

      let cart = await Cart.findOne({ userEmail });
      if (!cart) {
        cart = new Cart({ userEmail, items: [], total: 0 });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.inventoryItem.toString() === inventoryItemId
      );

      if (existingItemIndex > -1) {
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > inventoryItem.inStockQuantity) {
          return {
            success: false,
            error: `Exceeds available stock (${inventoryItem.inStockQuantity})`,
            code: "INSUFFICIENT_STOCK",
          };
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        cart.items.push({ inventoryItem: inventoryItemId, quantity });
      }

      cart.total = await this._calculateCartTotal(cart.items);
      await cart.save();

      return {
        success: true,
        cart: await Cart.findById(cart._id).populate("items.inventoryItem"),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to add item to cart",
        code: "ADD_ITEM_ERROR",
      };
    }
  }

  // Update item quantity
  async updateItemQuantity(userEmail, inventoryItemId, newQuantity) {
    try {
      if (!Types.ObjectId.isValid(inventoryItemId)) {
        return {
          success: false,
          error: "Invalid inventory item ID",
          code: "INVALID_INVENTORY_ID",
        };
      }

      if (newQuantity < 1) {
        return {
          success: false,
          error: "Quantity must be at least 1",
          code: "INVALID_QUANTITY",
        };
      }

      const cart = await Cart.findOne({ userEmail });
      if (!cart) {
        return {
          success: false,
          error: "Cart not found",
          code: "CART_NOT_FOUND",
        };
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.inventoryItem.toString() === inventoryItemId
      );

      if (itemIndex === -1) {
        return {
          success: false,
          error: "Item not in cart",
          code: "ITEM_NOT_IN_CART",
        };
      }

      const inventoryItem = await Inventory.findById(inventoryItemId);
      if (newQuantity > inventoryItem.inStockQuantity) {
        return {
          success: false,
          error: `Only ${inventoryItem.inStockQuantity} units available`,
          code: "INSUFFICIENT_STOCK",
        };
      }

      cart.items[itemIndex].quantity = newQuantity;
      cart.total = await this._calculateCartTotal(cart.items);
      await cart.save();

      return {
        success: true,
        cart: await Cart.findById(cart._id).populate("items.inventoryItem"),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update item quantity",
        code: "UPDATE_QUANTITY_ERROR",
      };
    }
  }

  // Remove item
  async removeItemFromCart(userEmail, inventoryItemId) {
    try {
      if (!Types.ObjectId.isValid(inventoryItemId)) {
        return {
          success: false,
          error: "Invalid inventory item ID",
          code: "INVALID_INVENTORY_ID",
        };
      }

      const cart = await Cart.findOne({ userEmail });
      if (!cart) {
        return {
          success: false,
          error: "Cart not found",
          code: "CART_NOT_FOUND",
        };
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item) => item.inventoryItem.toString() !== inventoryItemId
      );

      if (cart.items.length === initialLength) {
        return {
          success: false,
          error: "Item not in cart",
          code: "ITEM_NOT_IN_CART",
        };
      }

      cart.total = await this._calculateCartTotal(cart.items);
      await cart.save();

      return {
        success: true,
        cart: await Cart.findById(cart._id).populate("items.inventoryItem"),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to remove item",
        code: "REMOVE_ITEM_ERROR",
      };
    }
  }

  // Clear cart
  async clearCart(userEmail) {
    try {
      const cart = await Cart.findOne({ userEmail });
      if (!cart) {
        return {
          success: false,
          error: "Cart not found",
          code: "CART_NOT_FOUND",
        };
      }

      cart.items = [];
      cart.total = 0;
      await cart.save();

      return { success: true, cart };
    } catch (error) {
      return {
        success: false,
        error: "Failed to clear cart",
        code: "CLEAR_CART_ERROR",
      };
    }
  }

  // Private helper
  async _calculateCartTotal(items) {
    let total = 0;
    for (const item of items) {
      const inventoryItem = await Inventory.findById(item.inventoryItem);
      if (inventoryItem) {
        total += inventoryItem.price * item.quantity;
      }
    }
    return parseFloat(total.toFixed(2));
  }
}

//ESM export
export default new CartService();
