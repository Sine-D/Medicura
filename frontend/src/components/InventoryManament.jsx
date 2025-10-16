// components/InventoryManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  AlertCircle,
  X as XIcon,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import {
  getAllInventoryItems,
  deleteInventoryItem,
} from "../apis/inventoryApi";
import CreateInventory from "./CreateInventory";
import UpdateInventory from "./UpdateInventory";

const InventoryManagement = ({ triggerAddItem = false, onAddItemClose }) => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const fetchInventories = async () => {
    try {
      setLoading(true);
      const response = await getAllInventoryItems(searchTerm.length >= 3 ? searchTerm : "");
      setInventories(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load inventory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // Fetch inventories
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        setLoading(true);
        const response = await getAllInventoryItems(searchTerm.length >= 3 ? searchTerm : "");
        setInventories(response.data || []);
        setError(null);
      } catch (err) {
        setError("Failed to load inventory");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [searchTerm]);

  // Trigger add item modal when prop changes
  useEffect(() => {
    if (triggerAddItem) {
      setIsCreateModalOpen(true);
    }
  }, [triggerAddItem]);

  // Filtered inventories with memoization
  const filteredInventories = useMemo(() => {
    if (searchTerm.length >= 3) {
      // Server already filtered; just return
      return inventories;
    }
    // For 1-2 letters, filter client-side against full dataset
    if (!searchTerm) return inventories;
    const term = searchTerm.toLowerCase();
    return inventories.filter(
      (item) =>
        item.itemName.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        (item.supplierEmail || "").toLowerCase().includes(term)
    );
  }, [inventories, searchTerm]);

  // Handle edit
  const handleEdit = useCallback((inventory) => {
    setSelectedInventory(inventory);
    setIsUpdateModalOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteInventoryItem(id);
      setInventories((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  }, []);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = filteredInventories.map((item) => [
      item.itemName,
      item.itemCode,
      item.inStockQuantity,
      `$${item.price.toFixed(2)}`,
      item.supplierEmail,
      item.expireDate ? new Date(item.expireDate).toLocaleDateString() : "N/A",
    ]);

    autoTable(doc, {
      head: [["Item Name", "Code", "Stock", "Price", "Supplier", "Expiry"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save("inventory-report.pdf");
  }, [filteredInventories]);

  // Close modals
  const closeModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsUpdateModalOpen(false);
    setSelectedInventory(null);
    fetchInventories();
    // Call the parent callback to reset the trigger
    if (onAddItemClose) {
      onAddItemClose();
    }
  }, [onAddItemClose]);

  // Validate email format
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check low stock
  const isLowStock = (quantity) => quantity < 10;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-white/80">Manage your stock and suppliers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Export visible items to PDF"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 w-full max-w-xl">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, code, or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <XIcon size={18} />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Inventory Table */
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInventories.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventories.map((item, idx) => (
                  <tr key={item._id} className={idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {item.itemName}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-700">
                      {item.itemCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          isLowStock(item.inStockQuantity)
                            ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        }`}
                      >
                        {item.inStockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isValidEmail(item.supplierEmail) ? (
                        <a
                          href={`mailto:${item.supplierEmail}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {item.supplierEmail}
                        </a>
                      ) : (
                        <span className="text-gray-500">
                          {item.supplierEmail}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.expireDate
                        ? new Date(item.expireDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Add Item
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <CreateInventory onClose={closeModal} onCreated={() => {
                // Notify Home and refresh current list
                try { window.dispatchEvent(new CustomEvent("inventory:changed")); } catch (_) {}
                fetchInventories();
              }} />
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Item</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <UpdateInventory
                inventory={selectedInventory}
                onClose={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
