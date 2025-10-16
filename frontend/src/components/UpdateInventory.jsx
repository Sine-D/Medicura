// components/UpdateInventory.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, AlertCircle, ImageOff } from "lucide-react";
import cloudinaryService from "../services/cloudinaryService";
import { updateInventoryItem } from "../apis/inventoryApi";

const UpdateInventory = ({ inventory, onClose }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    itemCode: "",
    supplierEmail: "",
    description: "",
    price: "",
    expireDate: "",
    inStockQuantity: "",
  });
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with inventory data
  useEffect(() => {
    if (inventory) {
      console.log(originalImageUrl);
      console.dir(imageFile);
      setFormData({
        itemName: inventory.itemName || "",
        itemCode: inventory.itemCode || "",
        supplierEmail: inventory.supplierEmail || "",
        description: inventory.description || "",
        price: inventory.price ? inventory.price.toString() : "",
        expireDate: inventory.expireDate
          ? new Date(inventory.expireDate).toISOString().split("T")[0]
          : "",
        inStockQuantity: inventory.inStockQuantity?.toString() || "",
      });
      setOriginalImageUrl(inventory.imageUrl || "");
      setImageUrl(inventory.imageUrl || "");
    }
  }, [inventory]);

  // Validation rules
  const validations = {
    itemName: {
      required: true,
      pattern: /^.{1,100}$/,
      message: "Item name is required (1-100 characters)",
    },
    itemCode: {
      required: true,
      pattern: /^[A-Z0-9-_]{3,20}$/,
      message:
        "Item code must be 3-20 uppercase letters, numbers, hyphens, or underscores",
    },
    supplierEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Valid email is required",
    },
    price: {
      required: true,
      pattern: /^\d+(\.\d{1,2})?$/,
      message: "Price must be a valid number (e.g., 12.99)",
    },
    inStockQuantity: {
      required: true,
      pattern: /^\d+$/,
      message: "Quantity must be a positive integer",
    },
    expireDate: {
      required: false,
      custom: (value) => {
        if (!value) return true;
        const date = new Date(value);
        return date > new Date();
      },
      message: "Expiration date must be in the future",
    },
  };

  const validateField = (name, value) => {
    const rule = validations[name];
    if (!rule) return true;

    if (rule.required && !value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: rule.message }));
      return false;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: rule.message }));
      return false;
    }

    if (rule.custom && !rule.custom(value)) {
      setErrors((prev) => ({ ...prev, [name]: rule.message }));
      return false;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please upload an image file (JPG, PNG, etc.)",
      }));
      return;
    }

    setIsUploading(true);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });

    try {
      const result = await cloudinaryService.uploadImage(file);
      if (result.success) {
        setImageUrl(result.url);
        setImageFile(file);
      } else {
        setErrors((prev) => ({ ...prev, image: result.error }));
      }
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        image: "Upload failed. Please try again.",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImageFile(null);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.image;
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = Object.keys(validations).every((field) =>
      validateField(field, formData[field])
    );

    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        inStockQuantity: parseInt(formData.inStockQuantity, 10),
        imageUrl: imageUrl || undefined, // undefined removes the field
      };

      await updateInventoryItem(inventory._id, payload);
      try { window.dispatchEvent(new CustomEvent("inventory:changed")); } catch (_) {}
      onClose();
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to update item. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable past dates in date picker
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <ImageOff size={24} className="text-gray-400" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload size={18} />
              <span>{imageUrl ? "Change Image" : "Upload Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={removeImage}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove Image
              </button>
            )}
            <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
          </div>
        </div>
        {errors.image && (
          <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle size={16} />
            {errors.image}
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Item Name *
          </label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.itemName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Organic Almonds"
          />
          {errors.itemName && (
            <p className="mt-1 text-red-600 text-sm">{errors.itemName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="itemCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Item Code *
          </label>
          <input
            type="text"
            id="itemCode"
            name="itemCode"
            value={formData.itemCode}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.itemCode ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., ALM-ORG-001"
          />
          {errors.itemCode && (
            <p className="mt-1 text-red-600 text-sm">{errors.itemCode}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="supplierEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Supplier Email *
          </label>
          <input
            type="email"
            id="supplierEmail"
            name="supplierEmail"
            value={formData.supplierEmail}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.supplierEmail ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="supplier@example.com"
          />
          {errors.supplierEmail && (
            <p className="mt-1 text-red-600 text-sm">{errors.supplierEmail}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price ($) *
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="12.99"
          />
          {errors.price && (
            <p className="mt-1 text-red-600 text-sm">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="inStockQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stock Quantity *
          </label>
          <input
            type="number"
            id="inStockQuantity"
            name="inStockQuantity"
            value={formData.inStockQuantity}
            onChange={handleInputChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.inStockQuantity ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="150"
          />
          {errors.inStockQuantity && (
            <p className="mt-1 text-red-600 text-sm">
              {errors.inStockQuantity}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="expireDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiry Date
          </label>
          <input
            type="date"
            id="expireDate"
            name="expireDate"
            value={formData.expireDate}
            onChange={handleInputChange}
            min={today} // 🔒 Disables past dates
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
              errors.expireDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.expireDate && (
            <p className="mt-1 text-red-600 text-sm">{errors.expireDate}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Brief description of the item..."
        />
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={20} />
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              Updating...
            </>
          ) : (
            "Update Item"
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateInventory;
