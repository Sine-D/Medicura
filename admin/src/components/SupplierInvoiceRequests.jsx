import React, { useEffect, useState } from "react";
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Clock, 
  Package, 
  MessageSquare, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  RefreshCw,
  Download,
  FileText,
  Users,
  ArrowUpDown,
  X as XIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  getAllInventoryRequests,
  updateInventoryRequest,
} from "../apis/inventoryRequestApi";

const SupplierInvoiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [clientFilter, setClientFilter] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getAllInventoryRequests();
      const data = res.data;
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await updateInventoryRequest(id, { status });
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to update request. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedRequests.length === 0) {
      alert("Please select requests to perform bulk action.");
      return;
    }

    const confirmMessage = status === "approved" 
      ? `Are you sure you want to approve ${selectedRequests.length} request(s)?`
      : `Are you sure you want to ignore ${selectedRequests.length} request(s)?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const promises = selectedRequests.map(id => updateInventoryRequest(id, { status }));
      await Promise.all(promises);
      setSelectedRequests([]);
      fetchRequests();
      alert(`Successfully updated ${selectedRequests.length} request(s).`);
    } catch (err) {
      console.error(err);
      alert("Failed to update some requests. Please try again.");
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req._id));
    }
  };

  const handleSelectRequest = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(reqId => reqId !== id)
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

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter({ from: "", to: "" });
    setClientFilter("");
  };

  const exportToCSV = () => {
    const csvData = filteredRequests.map(req => ({
      "Request ID": req._id,
      "Medicines": req.medicines?.map(m => `${m.medicineName} (Qty: ${m.quantity})`).join(", ") || "",
      "Message": req.message || "",
      "Status": req.status,
      "Created Date": new Date(req.createdAt).toLocaleDateString(),
      "Client": req.clientName || "N/A"
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "sent").length,
    approved: requests.filter(r => r.status === "approved").length,
    ignored: requests.filter(r => r.status === "ignored").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent": return <Clock className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "ignored": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "sent": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "ignored": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.medicines?.some((m) =>
      m.medicineName.toLowerCase().includes(search.toLowerCase())
    ) || r.message?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    const matchesClient = !clientFilter || 
      (r.clientName && r.clientName.toLowerCase().includes(clientFilter.toLowerCase()));
    
    const matchesDate = (!dateFilter.from || new Date(r.createdAt) >= new Date(dateFilter.from)) &&
      (!dateFilter.to || new Date(r.createdAt) <= new Date(dateFilter.to));
    
    return matchesSearch && matchesStatus && matchesClient && matchesDate;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === "medicines") {
      aValue = a.medicines?.[0]?.medicineName || "";
      bValue = b.medicines?.[0]?.medicineName || "";
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
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
          </div>
          <p className="text-gray-600">Manage and respond to inventory requests from clients</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ignored</p>
                <p className="text-2xl font-bold text-red-600">{stats.ignored}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
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
                  placeholder="Search by medicine name, message, or client..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={fetchRequests}
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
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="sent">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                      placeholder="Filter by client..."
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

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading requests...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Requests ({filteredRequests.length})
                  </h3>
                  
                  {selectedRequests.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {selectedRequests.length} selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkAction("approved")}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Bulk Approve
                        </button>
                        <button
                          onClick={() => handleBulkAction("ignored")}
                          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Bulk Ignore
                        </button>
                        <button
                          onClick={() => setSelectedRequests([])}
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
              
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    {search || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No inventory requests have been submitted yet"}
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
                              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Select All
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort("medicines")}
                        >
                          <div className="flex items-center gap-1">
                            Request Details
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
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
                          onClick={() => handleSort("createdAt")}
                        >
                          <div className="flex items-center gap-1">
                            Created
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((req) => (
                        <tr key={req._id} className={`hover:bg-gray-50 transition-colors ${selectedRequests.includes(req._id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-6 py-6">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(req._id)}
                              onChange={() => handleSelectRequest(req._id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-6">
                            <div className="space-y-2">
                              {req.medicines?.map((m, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="p-1 bg-blue-100 rounded">
                                    <Package className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {m.medicineName}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Qty: {m.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          
                          <td className="px-6 py-6">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900 max-w-xs">
                                {req.message || "No message provided"}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-6">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                              {getStatusIcon(req.status)}
                              {req.status?.charAt(0).toUpperCase() + req.status?.slice(1)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          
                          <td className="px-6 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(req)}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              
                              {req.status === "sent" && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to approve this request?")) {
                                        handleAction(req._id, "approved");
                                      }
                                    }}
                                    disabled={actionLoading[req._id]}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {actionLoading[req._id] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to ignore this request?")) {
                                        handleAction(req._id, "ignored");
                                      }
                                    }}
                                    disabled={actionLoading[req._id]}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {actionLoading[req._id] ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                                    ) : (
                                      <X className="w-4 h-4" />
                                    )}
                                    Ignore
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request ID</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest._id}</p>
              </div>

              {/* Medicines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicines Requested</label>
                <div className="space-y-3">
                  {selectedRequest.medicines?.map((medicine, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{medicine.medicineName}</h4>
                          <p className="text-sm text-gray-600">Quantity: {medicine.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.message || "No message provided"}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1)}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Client Information */}
              {selectedRequest.clientName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedRequest.clientName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              {selectedRequest.status === "sent" && (
                <>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to approve this request?")) {
                        handleAction(selectedRequest._id, "approved");
                        setShowViewModal(false);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to ignore this request?")) {
                        handleAction(selectedRequest._id, "ignored");
                        setShowViewModal(false);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Ignore Request
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
  );
};

export default SupplierInvoiceRequests;
