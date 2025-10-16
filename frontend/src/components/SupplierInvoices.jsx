import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  X, 
  Send, 
  Search,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X as XIcon,
  Users,
  Package,
  TrendingUp,
  BarChart3
} from "lucide-react";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { generateEnhancedInvoicePDF } from "../utils/enhancedPdfGenerator";
import {
  getAllInventoryInvoices,
  deleteInventoryInvoice,
} from "../apis/inventoryInvoiceApi";
import CreateInvoiceModal from "./CreateInvoiceModal";
import EditInvoiceModal from "./EditInvoiceModal";

const SupplierInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, data: null });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await getAllInventoryInvoices("pending");
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
      generateEnhancedInvoicePDF(inv);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to basic PDF if enhanced version fails
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await deleteInventoryInvoice(id);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) {
      alert("Please select invoices to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoice(s)?`)) return;

    try {
      const promises = selectedInvoices.map(id => deleteInventoryInvoice(id));
      await Promise.all(promises);
      setSelectedInvoices([]);
      fetchInvoices();
      alert(`Successfully deleted ${selectedInvoices.length} invoice(s).`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete some invoices. Please try again.");
    }
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filtered.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filtered.map(inv => inv._id));
    }
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invId => invId !== id)
        : [...prev, id]
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter({ from: "", to: "" });
    setAmountFilter({ min: "", max: "" });
  };

  const exportToCSV = () => {
    const csvData = filtered.map(inv => ({
      "Invoice ID": inv._id,
      "Items": inv.items.map(item => `${item.name} (Qty: ${item.quantity})`).join(", "),
      "Status": inv.status,
      "Total Amount": inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
      "Created Date": new Date(inv.createdAt).toLocaleDateString(),
      "Client": inv.clientName || "N/A"
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      // Note: You'll need to add updateInventoryInvoiceStatus to your API
      // await updateInventoryInvoiceStatus(id, { status });
      fetchInvoices();
      alert(`Invoice status updated to ${status}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to update invoice status. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    pending: invoices.filter(inv => inv.status === "pending").length,
    paid: invoices.filter(inv => inv.status === "paid").length,
    cancelled: invoices.filter(inv => inv.status === "cancelled").length,
    totalAmount: invoices.reduce((sum, inv) => 
      sum + inv.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0), 0
    )
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "paid": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paid": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch = inv.items.some((i) => 
      i.name.toLowerCase().includes(search.toLowerCase())
    ) || (inv.clientName && inv.clientName.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    const total = inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const matchesAmount = (!amountFilter.min || total >= parseFloat(amountFilter.min)) &&
      (!amountFilter.max || total <= parseFloat(amountFilter.max));
    
    const matchesDate = (!dateFilter.from || new Date(inv.createdAt) >= new Date(dateFilter.from)) &&
      (!dateFilter.to || new Date(inv.createdAt) <= new Date(dateFilter.to));
    
    return matchesSearch && matchesStatus && matchesAmount && matchesDate;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === "total") {
      aValue = a.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      bValue = b.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (sortField === "items") {
      aValue = a.items[0]?.name || "";
      bValue = b.items[0]?.name || "";
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          </div>
          <p className="text-gray-600">Create, manage, and track your inventory invoices</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Top Row - Search and Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                  type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by medicine name or client..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={fetchInvoices}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-3 bg-green-100 border border-green-300 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                    showFilters 
                      ? "bg-blue-50 border-blue-300 text-blue-700" 
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
            <button
              onClick={() => setModal({ type: "create", data: null })}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                    <input
                      type="number"
                      value={amountFilter.min}
                      onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                      placeholder="Min amount..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                    <input
                      type="number"
                      value={amountFilter.max}
                      onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                      placeholder="Max amount..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateFilter.from}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateFilter.to}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                    Clear Filters
            </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading invoices...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Invoices ({filtered.length})
                  </h3>
                  
                  {selectedInvoices.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedInvoices.length} selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleBulkDelete}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Bulk Delete
                        </button>
                        <button
                          onClick={() => setSelectedInvoices([])}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    {search || statusFilter !== "all" || dateFilter.from || dateFilter.to || amountFilter.min || amountFilter.max
                      ? "Try adjusting your search or filter criteria" 
                      : "No invoices have been created yet"}
                  </p>
          </div>
        ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.length === filtered.length && filtered.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Select All
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("items")}
                        >
                          <div className="flex items-center gap-1">
                            Items
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("total")}
                        >
                          <div className="flex items-center gap-1">
                            Total Amount
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Created Date
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((inv) => {
                  const canAct = inv.status === "pending";
                  const total = inv.items.reduce(
                    (s, i) => s + i.price * i.quantity,
                    0
                  );
                  return (
                          <tr key={inv._id} className={`hover:bg-gray-50 transition-colors ${selectedInvoices.includes(inv._id) ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-6">
                              <input
                                type="checkbox"
                                checked={selectedInvoices.includes(inv._id)}
                                onChange={() => handleSelectInvoice(inv._id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-6">
                              <div className="space-y-2">
                                {inv.items.map((item, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="p-1 bg-blue-100 rounded">
                                      <Package className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </span>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Qty: {item.quantity}
                              </span>
                                    <span className="text-xs text-gray-500">
                                      ${item.price.toFixed(2)} each
                            </span>
                                  </div>
                          ))}
                        </div>
                      </td>
                            <td className="px-6 py-6">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                {getStatusIcon(inv.status)}
                                {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                        </span>
                      </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-900">
                                  ${total.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                        {new Date(inv.createdAt).toLocaleDateString()}
                              </div>
                      </td>
                            <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewDetails(inv)}
                                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                
                          <button
                            onClick={() => exportInvoicePDF(inv)}
                                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Download PDF"
                          >
                                  <Download className="w-4 h-4" />
                                  PDF
                          </button>
                                
                                {canAct && (
                                  <>
                          <button
                                      onClick={() => setModal({ type: "edit", data: inv })}
                                      disabled={actionLoading[inv._id]}
                                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {actionLoading[inv._id] ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-indigo-600"></div>
                                      ) : (
                                        <Edit className="w-4 h-4" />
                                      )}
                                      Edit
                          </button>
                                    
                          <button
                                      onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this invoice?")) {
                                          handleDelete(inv._id);
                                        }
                                      }}
                                      disabled={actionLoading[inv._id]}
                                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {actionLoading[inv._id] ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                      Delete
                          </button>
                                  </>
                                )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
              </div>
              )}
            </>
            )}
          </div>

        {/* Modals */}
        {modal.type === "create" && (
          <CreateInvoiceModal
            onClose={() => setModal({ type: null, data: null })}
            onCreated={fetchInvoices}
          />
        )}
        {modal.type === "edit" && (
          <EditInvoiceModal
            invoice={modal.data}
            onClose={() => setModal({ type: null, data: null })}
            onUpdated={fetchInvoices}
          />
        )}

        {/* View Details Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Invoice ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInvoice._id}</p>
                </div>

                {/* Items */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Items</label>
                  <div className="space-y-3">
                    {selectedInvoice.items?.map((item, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                            <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${selectedInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusIcon(selectedInvoice.status)}
                    {selectedInvoice.status?.charAt(0).toUpperCase() + selectedInvoice.status?.slice(1)}
                  </span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedInvoice.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(selectedInvoice.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Client Information */}
                {selectedInvoice.clientName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedInvoice.clientName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => exportInvoicePDF(selectedInvoice)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {selectedInvoice.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setModal({ type: "edit", data: selectedInvoice });
                        setShowViewModal(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Invoice
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this invoice?")) {
                          handleDelete(selectedInvoice._id);
                          setShowViewModal(false);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Invoice
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierInvoices;

