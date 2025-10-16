import React, { useEffect, useState, useCallback } from "react";
import { 
  getInvoices, 
  deleteInvoice,
  exportInvoicePDFById,
  exportInvoiceExcelById 
} from "../services/invoiceService";
import InvoiceForm from "../components/InvoiceForm";

const InvoicePage = ({ darkMode = false, onUpdate }) => {
  const [invoices, setInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [downloading, setDownloading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await getInvoices();
      const invoicesData = response.data?.invoices || [];
      setInvoices(invoicesData);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setInvoices([]);
    }
  }, [onUpdate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id);
        await fetchInvoices();
      } catch (err) {
        console.error("Error deleting invoice:", err);
        alert("Failed to delete invoice");
      }
    }
  };

  const downloadFile = async (id, type) => {
    if (downloading) return;
    
    try {
      setDownloading(true);
      console.log(`Downloading ${type.toUpperCase()} for invoice ID:`, id);
      
      let response;
      if (type === "pdf") {
        response = await exportInvoicePDFById(id);
      } else {
        response = await exportInvoiceExcelById(id);
      }

      // Check if we got data
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Create blob with correct MIME type
      const mimeType = type === "pdf" 
        ? "application/pdf" 
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      
      const blob = new Blob([response.data], { type: mimeType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${id}.${type === "pdf" ? "pdf" : "xlsx"}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`${type.toUpperCase()} downloaded successfully`);
    } catch (err) {
      console.error(`Error downloading ${type}:`, err);
      
      // Show detailed error message
      let errorMessage = `Failed to download ${type}.`;
      if (err.response) {
        errorMessage += ` Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage += " No response from server. Check if backend is running on port 4000.";
      } else {
        errorMessage += ` ${err.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.patientId.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toString().includes(search)
  );

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${localDarkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className="flex justify-end mb-4">
        <button
          className={`px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${
            localDarkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
          }`}
          onClick={() => setLocalDarkMode(!localDarkMode)}
        >
          {localDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className={`${localDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 mb-8 shadow-2xl border transform hover:scale-[1.02] transition-all duration-300`}>
        <h1 className={`text-4xl md:text-5xl font-black mb-2 ${localDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          🧾 MediCura Invoices
        </h1>
        <p className={`${localDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg font-medium`}>
          Manage, download, and track your medical invoices easily
        </p>
      </div>

      <div className={`${localDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 mb-8 shadow-2xl border transform hover:scale-[1.02] transition-all duration-300`}>
        <InvoiceForm
          currentInvoice={currentInvoice}
          refresh={fetchInvoices}
          clearEdit={() => setCurrentInvoice(null)}
          darkMode={localDarkMode}
        />
      </div>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="🔍 Search invoices by ID or Patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full max-w-2xl px-6 py-4 rounded-2xl font-medium shadow-lg transition-all duration-300 focus:shadow-2xl focus:scale-[1.02] ${
            localDarkMode 
              ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
              : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } border-2 outline-none backdrop-blur-xl`}
        />
      </div>

      <div className={`${localDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl shadow-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${localDarkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}>
              <tr>
                {['ID', 'Patient', 'Total', 'Status', 'Date', 'Cashier', 'Items', 'Actions'].map((header) => (
                  <th key={header} className="py-4 px-6 text-left font-bold text-sm uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, i) => (
                  <tr
                    key={inv._id}
                    className={`${i % 2 === 0 ? (localDarkMode ? 'bg-gray-700/30' : 'bg-blue-50/50') : (localDarkMode ? 'bg-gray-700/10' : 'bg-white/50')} hover:${localDarkMode ? 'bg-blue-900/30' : 'bg-blue-100/70'} transition-all duration-200 transform hover:scale-[1.01]`}
                  >
                    <td className={`py-4 px-6 font-bold ${localDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{inv.id}</td>
                    <td className={`py-4 px-6 font-semibold ${localDarkMode ? 'text-white' : 'text-gray-900'}`}>{inv.patientId}</td>
                    <td className={`py-4 px-6 font-black text-lg ${localDarkMode ? 'text-green-400' : 'text-green-600'}`}>Rs. {inv.total.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-800"
                            : inv.status.toLowerCase() === "unpaid"
                            ? "bg-red-100 text-red-800"
                            : inv.status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-4 px-6 ${localDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(inv.date).toLocaleDateString()}</td>
                    <td className={`py-4 px-6 font-mono text-sm ${localDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{inv.cashierId || "N/A"}</td>
                    <td className={`py-4 px-6 ${localDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {inv.items?.length > 0 ? (
                        <div className="max-h-20 overflow-y-auto">
                          {inv.items.map((item, idx) => (
                            <div key={idx} className="text-xs mb-1">
                              {item.service} - {item.quantity} x Rs. {item.price.toLocaleString()}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <i className="text-gray-400">No items</i>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setCurrentInvoice(inv)}
                          className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all text-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id)}
                          className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all text-sm"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => downloadFile(inv._id, "pdf")}
                          disabled={downloading}
                          className={`px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all text-sm ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => downloadFile(inv._id, "excel")}
                          disabled={downloading}
                          className={`px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all text-sm ${downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          📊 Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={`py-12 text-center ${localDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg font-semibold`}>
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-6xl">📭</span>
                      <span>No invoices found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;