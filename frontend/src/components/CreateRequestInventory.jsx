import React, { useState } from "react";
import { Loader2, Send, Plus, Trash2, X } from "lucide-react";
import { createInventoryRequest } from "../apis/inventoryRequestApi";

const CreateRequestInventory = ({ onClose, onCreated }) => {
  const [medicines, setMedicines] = useState([
    { medicineName: "", manufacturer: "", quantity: "" },
  ]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateField = (name, value) => {
    switch (name) {
      case "medicineName":
        if (!value.trim()) return "Medicine name is required";
        if (value.length > 150)
          return "Medicine name cannot exceed 150 characters";
        if (!/^[a-zA-Z0-9\s-.,()]+$/.test(value))
          return "Medicine name contains invalid characters";
        return "";
      case "manufacturer":
        if (value && value.length > 150)
          return "Manufacturer name cannot exceed 150 characters";
        if (value && !/^[a-zA-Z0-9\s-.,()]+$/.test(value))
          return "Manufacturer name contains invalid characters";
        return "";
      case "quantity":
        if (!value) return "Quantity is required";
        if (!/^\d+$/.test(value)) return "Quantity must be a positive integer";
        if (parseInt(value) < 1) return "Quantity must be at least 1";
        return "";
      case "message":
        if (value && value.length > 500)
          return "Message cannot exceed 500 characters";
        return "";
      default:
        return "";
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = medicines.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    setMedicines(updated);
    const error = validateField(field, value);
    setErrors((p) => ({ ...p, [`${field}_${index}`]: error }));
  };

  const handleMessageChange = (value) => {
    setMessage(value);
    const error = validateField("message", value);
    setErrors((p) => ({ ...p, message: error }));
  };

  const addMedicine = () =>
    setMedicines([
      ...medicines,
      { medicineName: "", manufacturer: "", quantity: "" },
    ]);

  const removeMedicine = (index) => {
    if (medicines.length === 1) return;
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    setErrors((p) => {
      const next = { ...p };
      delete next[`medicineName_${index}`];
      delete next[`manufacturer_${index}`];
      delete next[`quantity_${index}`];
      return next;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    medicines.forEach((m, i) => {
      Object.keys(m).forEach((f) => {
        const err = validateField(f, m[f]);
        if (err) newErrors[`${f}_${i}`] = err;
      });
    });
    const msgErr = validateField("message", message);
    if (msgErr) newErrors.message = msgErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmitError("");
    try {
      const payload = {
        medicines: medicines.map((m) => ({
          ...m,
          quantity: parseInt(m.quantity),
        })),
        message,
      };
      const { data } = await createInventoryRequest(payload);
      onCreated(data);
      window.location.reload();
    } catch (e) {
      setSubmitError(
        e.response?.data?.message || "Failed to create inventory request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Create Inventory Request
          </h2>
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
              <h3 className="text-lg font-medium text-gray-800">Medicines</h3>
              <button
                onClick={addMedicine}
                className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Medicine
              </button>
            </div>

            {medicines.map((m, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Medicine #{i + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={m.medicineName}
                      onChange={(e) =>
                        handleMedicineChange(i, "medicineName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`medicineName_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter medicine name"
                    />
                    {errors[`medicineName_${i}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`medicineName_${i}`]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={m.manufacturer}
                      onChange={(e) =>
                        handleMedicineChange(i, "manufacturer", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`manufacturer_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter manufacturer"
                    />
                    {errors[`manufacturer_${i}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`manufacturer_${i}`]}
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
                      value={m.quantity}
                      onChange={(e) =>
                        handleMedicineChange(i, "quantity", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`quantity_${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter quantity"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows="3"
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter additional message"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
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
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? "Creating..." : "Create Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestInventory;
