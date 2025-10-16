import { useEffect, useMemo, useState } from "react";
import {
  getAllInventoryRequests,
  deleteInventoryRequest,
} from "../apis/inventoryRequestApi";

import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import CreateRequestInventory from "./CreateRequestInventory";
import EditReuqestInventory from "./EditReuqestInventory";

const InventoryRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modal, setModal] = useState({ type: null, data: null });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await getAllInventoryRequests();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Requests", 14, 16);
    autoTable(doc, {
      head: [["Medicines", "Message", "Status", "Created At"]],
      body: filteredRequests.map((r) => [
        r.medicines.map((m) => `${m.medicineName} (${m.quantity})`).join(", "),
        r.message,
        r.status,
        new Date(r.createdAt).toLocaleDateString(),
      ]),
      startY: 24,
    });
    doc.save("inventory-requests.pdf");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      await deleteInventoryRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  /* --------------------------------------------------
   * Search filter
   * -------------------------------------------------- */
  const filteredRequests = useMemo(() => {
    const term = search.toLowerCase();
    return requests.filter((r) => {
      const matchesTerm = term
        ? r.medicines?.some((m) => m.medicineName.toLowerCase().includes(term)) ||
          (r.message || "").toLowerCase().includes(term)
        : true;
      const matchesStatus = statusFilter === "all" ? true : r.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Inventory Requests</h1>
              <p className="text-white/80">Track, create, and manage medicine requests</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicine or message..."
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white text-gray-800"
                title="Filter by status"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
                <option value="ignored">Ignored</option>
              </select>
              <button
                onClick={exportPDF}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                Export PDF
              </button>
              <button
                onClick={() => setModal({ type: "create", data: null })}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition font-medium"
              >
                + Create
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Medicines</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req, idx) => {
                  const canAct = req.status === "sent";
                  return (
                    <tr key={req._id} className={idx % 2 === 1 ? "bg-gray-50/40 hover:bg-gray-50" : "hover:bg-gray-50"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {req.medicines.map((m) => (
                            <span
                              key={m.medicineName}
                              className="text-gray-800"
                            >
                              {m.medicineName}{" "}
                              <span className="text-gray-400">
                                x{m.quantity}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">{req.message}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${
                            req.status === "sent"
                              ? "bg-yellow-50 text-yellow-800 ring-yellow-200"
                              : req.status === "approved"
                              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                              : "bg-gray-50 text-gray-800 ring-gray-200"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={!canAct}
                            onClick={() =>
                              setModal({ type: "edit", data: req })
                            }
                            className={`p-2 rounded-lg transition ${
                              canAct
                                ? "text-indigo-600 hover:bg-indigo-50"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            disabled={!canAct}
                            onClick={() => handleDelete(req._id)}
                            className={`p-2 rounded-lg transition ${
                              canAct
                                ? "text-red-600 hover:bg-red-50"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!filteredRequests.length && (
              <div className="text-center py-10 text-gray-500">
                No requests found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.type === "create" && (
        <CreateRequestInventory
          onClose={() => {
            setModal({ type: null, data: null });
            fetchRequests();
          }}
          onCreated={(newReq) => {
            console.log(newReq);
            fetchRequests();
          }}
        />
      )}

      {modal.type === "edit" && (
        <EditReuqestInventory
          request={modal.data}
          onClose={() => setModal({ type: null, data: null })}
          onUpdated={(updated) =>
            setRequests((prev) =>
              prev.map((r) => (r._id === updated._id ? updated : r))
            )
          }
        />
      )}
    </div>
  );
};

export default InventoryRequestManagement;
