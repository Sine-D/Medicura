import cartService from "../services/cart.service.js";

const handleResponse = (res, result) => {
  if (result.success) {
    return res.status(200).json(result.data);
  }

  const statusMap = {
    CART_NOT_FOUND: 404,
    INVENTORY_NOT_FOUND: 404,
    INVALID_INVENTORY_ID: 400,
    INVALID_QUANTITY: 400,
    INSUFFICIENT_STOCK: 400,
    ITEM_NOT_IN_CART: 404,
  };

  const statusCode = statusMap[result.code] || 500;
  return res
    .status(statusCode)
    .json({ error: result.error, code: result.code });
};

const getCart = async (req, res) => {
  const result = await cartService.getOrCreateCart(req.params.email);
  return res.json(result);
};

const addItem = async (req, res) => {
  const { inventoryItemId, quantity = 1 } = req.body;
  const result = await cartService.addItemToCart(
    req.params.email,
    inventoryItemId,
    quantity
  );
  handleResponse(res, result);
};

const updateItem = async (req, res) => {
  const { inventoryItemId, quantity } = req.body;
  const result = await cartService.updateItemQuantity(
    req.params.email,
    inventoryItemId,
    quantity
  );
  handleResponse(res, result);
};

const removeItem = async (req, res) => {
  const result = await cartService.removeItemFromCart(
    req.params.email,
    req.params.itemId
  );
  handleResponse(res, result);
};

const clearCart = async (req, res) => {
  const result = await cartService.clearCart(req.params.email);
  handleResponse(res, result);
};

export default {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
