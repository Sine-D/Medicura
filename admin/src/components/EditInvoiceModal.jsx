import React, { useState, useEffect } from "react";
import { X, Send, Plus, Trash2 } from "lucide-react";
import { updateInventoryInvoice } from "../apis/inventoryInvoiceApi";

const EditInvoiceModal = ({ invoice, onClose, onUpdated }) => {
  const [items, setItems] = useState(
    invoice?.items.map((i) => ({
      ...i,
      price: i.price.toString(),
      quantity: i.quantity.toString(),
    })) || []
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(
      invoice?.items.map((i) => ({
        ...i,
        price: i.price.toString(),
        quantity: i.quantity.toString(),
      })) || []
    );
  }, [invoice]);

  const validate = (idx, field, val) => {
    switch (field) {
      case "name":
        return !val.trim()
          ? "Name required"
          : val.length > 150
          ? "Too long"
          : "";
      case "price": {
        const p = parseFloat(val);
        return !val || isNaN(p) || p <= 0 ? "Valid price > 0" : "";
      }
      case "quantity": {
        const q = parseInt(val);
        return !val || isNaN(q) || q < 1 ? "Valid integer ≥ 1" : "";
      }
      default:
        return "";
    }
  };

  const handleChange = (idx, field, val) => {
    const upd = items.map((it, i) =>
      i === idx ? { ...it, [field]: val } : it
    );
    setItems(upd);
    setErrors((p) => ({
      ...p,
      [`${field}_${idx}`]: validate(idx, field, val),
    }));
  };

  const addItem = () =>
    setItems([...items, { name: "", price: "", quantity: "" }]);

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
    setErrors((p) => {
      const n = { ...p };
      delete n[`name_${idx}`];
      delete n[`price_${idx}`];
      delete n[`quantity_${idx}`];
      return n;
    });
  };

  const validateAll = () => {
    const e = {};
    items.forEach((it, i) => {
      Object.keys(it).forEach((f) => {
        const err = validate(i, f, it[f]);
        if (err) e[`${f}_${i}`] = err;
      });
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({
          name: it.name.trim(),
          price: parseFloat(it.price),
          quantity: parseInt(it.quantity),
        })),
      };
      const { data } = await updateInventoryInvoice(invoice._id, payload);
      onUpdated(data);
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Items</h3>
              <button
                onClick={addItem}
                className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>

            {items.map((it, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Item #{i + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleChange(i, "name", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`name_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Medicine name"
                    />
                    {errors[`name_${i}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`name_${i}`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={it.price}
                      onChange={(e) => handleChange(i, "price", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`price_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`price_${i}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`price_${i}`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) =>
                        handleChange(i, "quantity", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`quantity_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="1"
                    />
                    {errors[`quantity_${i}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`quantity_${i}`]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInvoiceModal;
