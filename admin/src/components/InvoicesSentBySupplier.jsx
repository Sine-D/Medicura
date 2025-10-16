import React, { useEffect, useState } from "react";
import { Download, Edit, FileText, Check, X } from "lucide-react";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import {
  getAllInventoryInvoices,
  updateInventoryInvoice,
} from "../apis/inventoryInvoiceApi";

const EditSentModal = ({ invoice, onClose, onUpdated }) => {
  const [status, setStatus] = useState(invoice.status);
  const [items, setItems] = useState(
    invoice.items.map((i) => ({ ...i, quantity: i.quantity.toString() }))
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateQty = (v) => {
    const q = parseInt(v);
    return !v || isNaN(q) || q < 1 ? "Qty ≥ 1" : "";
  };

  const handleQtyChange = (idx, val) => {
    const upd = items.map((it, i) =>
      i === idx ? { ...it, quantity: val } : it
    );
    setItems(upd);
    setErrors((p) => ({ ...p, [`qty_${idx}`]: validateQty(val) }));
  };

  const validateAll = () => {
    const e = {};
    items.forEach((it, i) => {
      const err = validateQty(it.quantity);
      if (err) e[`qty_${i}`] = err;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setLoading(true);
    try {
      const payload = {
        status,
        items: items.map((it) => ({ ...it, quantity: parseInt(it.quantity) })),
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Update Invoice
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items
            </label>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 items-center mb-2">
                <span className="text-gray-800">{it.name}</span>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => handleQtyChange(i, e.target.value)}
                  className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors[`qty_${i}`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[`qty_${i}`] && (
                  <p className="text-sm text-red-600">{errors[`qty_${i}`]}</p>
                )}
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
            <Check className="w-4 h-4 mr-2" />
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoicesSentBySupplier = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, data: null });
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await getAllInventoryInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const exportInvoicePDF = (inv) => {
    try {
      // Use dynamic import for enhanced PDF generator
      import("../utils/enhancedPdfGenerator").then(({ generateEnhancedInvoicePDF }) => {
        generateEnhancedInvoicePDF(inv);
      }).catch((error) => {
        console.error("Error loading enhanced PDF generator:", error);
        // Fallback to basic PDF
        const doc = new jsPDF();
        doc.text(`Invoice - ${inv._id}`, 14, 16);
        autoTable(doc, {
          head: [["Medicine", "Price ($)", "Qty", "Total ($)"]],
          body: inv.items.map((i) => [
            i.name,
            i.price.toFixed(2),
            i.quantity,
            (i.price * i.quantity).toFixed(2),
          ]),
          startY: 24,
        });
        const total = inv.items.reduce((s, i) => s + i.price * i.quantity, 0);
        doc.text(`Total: $${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
        doc.save(`invoice-${inv._id}.pdf`);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to basic PDF
      const doc = new jsPDF();
      doc.text(`Invoice - ${inv._id}`, 14, 16);
      autoTable(doc, {
        head: [["Medicine", "Price ($)", "Qty", "Total ($)"]],
        body: inv.items.map((i) => [
          i.name,
          i.price.toFixed(2),
          i.quantity,
          (i.price * i.quantity).toFixed(2),
        ]),
        startY: 24,
      });
      const total = inv.items.reduce((s, i) => s + i.price * i.quantity, 0);
      doc.text(`Total: $${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
      doc.save(`invoice-${inv._id}.pdf`);
    }
  };

  const filtered = invoices.filter((inv) => {
    const term = search.toLowerCase();
    const matchesTerm = term
      ? inv.items.some((i) => i.name.toLowerCase().includes(term))
      : true;
    const matchesStatus = statusFilter === "all" ? true : inv.status === statusFilter;
    return matchesTerm && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Sent Invoices</h1>
              <p className="text-white/80">Review, filter, and export supplier invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicine..."
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-gray-800"
                title="Filter by status"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total ($)</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((inv, idx) => {
                  const canEdit = inv.status === "pending";
                  const total = inv.items.reduce(
                    (s, i) => s + i.price * i.quantity,
                    0
                  );
                  return (
                    <tr key={inv._id} className={idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {inv.items.map((it) => (
                            <span key={it.name} className="text-gray-800">
                              {it.name}{" "}
                              <span className="text-gray-400">
                                x{it.quantity}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${
                            inv.status === "pending"
                              ? "bg-yellow-50 text-yellow-800 ring-yellow-200"
                              : inv.status === "approved"
                              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                              : "bg-red-50 text-red-800 ring-red-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => exportInvoicePDF(inv)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            disabled={!canEdit}
                            onClick={() =>
                              setModal({ type: "edit", data: inv })
                            }
                            className={`p-2 rounded-lg transition ${
                              canEdit
                                ? "text-indigo-600 hover:bg-indigo-50"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="text-center py-10 text-gray-500">
                No invoices found.
              </div>
            )}
          </div>
        )}

        {modal.type === "edit" && (
          <EditSentModal
            invoice={modal.data}
            onClose={() => setModal({ type: null, data: null })}
            onUpdated={(updated) =>
              setInvoices((prev) =>
                prev.map((i) => (i._id === updated._id ? updated : i))
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default InvoicesSentBySupplier;
