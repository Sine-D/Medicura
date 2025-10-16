import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

import {
  getCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
} from "../apis/cartApi";
import { currentUserEmail } from "../contexts/userContext";

const MyCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await getCart(currentUserEmail);
      setCart(response.data.cart);
      setError(null);
    } catch (err) {
      setError("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!currentUserEmail) return;

    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await getCart(currentUserEmail);
        setCart(response.data.cart);
        setError(null);
      } catch (err) {
        setError("Failed to load cart");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [currentUserEmail]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setActionLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      await updateCartItem(currentUserEmail, {
        inventoryItemId: itemId,
        quantity: newQuantity,
      });
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity");
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Remove this item from cart?")) return;

    setActionLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      await removeItemFromCart(currentUserEmail, itemId);
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;

    try {
      await clearCart(currentUserEmail);
      setCart({ items: [], total: 0, userEmail: currentUserEmail });
    } catch (err) {
      console.error(err);
      alert("Failed to clear cart");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!currentUserEmail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Not Logged In
          </h2>
          <p className="mt-2 text-gray-600">Please log in to view your cart.</p>
          <a
            href="/"
            className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-gray-200 rounded w-16 h-16"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        {cart?.items?.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!cart?.items?.length ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-600">Add some items to get started.</p>
          <a
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {cart.items.map((item) => (
              <div
                key={item.inventoryItem._id}
                className="border-b border-gray-100 last:border-0"
              >
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                  {item.inventoryItem.imageUrl ? (
                    <img
                      src={item.inventoryItem.imageUrl}
                      alt={item.inventoryItem.itemName}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          "https://placehold.co/80x80?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {item.inventoryItem.itemName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.inventoryItem.itemCode}
                    </p>
                    <p className="mt-2 text-lg font-bold text-blue-600">
                      {formatPrice(item.inventoryItem.price)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.inventoryItem._id,
                            item.quantity - 1
                          )
                        }
                        disabled={
                          actionLoading[item.inventoryItem._id] ||
                          item.quantity <= 1
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.inventoryItem._id,
                            item.quantity + 1
                          )
                        }
                        disabled={actionLoading[item.inventoryItem._id]}
                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.inventoryItem._id)}
                      disabled={actionLoading[item.inventoryItem._id]}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>
            <button
              disabled={cart.items.length === 0}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCart;
