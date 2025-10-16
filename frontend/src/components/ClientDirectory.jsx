import React, { useState, useEffect } from "react";
import { getAllClients as apiGetAllClients, createClient as apiCreateClient, updateClient as apiUpdateClient, deleteClient as apiDeleteClient } from "../apis/clientsApi";
import { 
  Search,
  Plus,
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X as XIcon,
  FileText,
  MessageSquare,
  Activity,
  Star,
  MoreVertical,
  UserPlus,
  UserMinus,
  Settings
} from "lucide-react";

const initialClients = [];

export default function ClientDirectory() {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesClient, setNotesClient] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiGetAllClients();
        const mapped = data.map((c) => ({
          id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status,
          registrationDate: c.createdAt?.slice(0,10) || new Date().toISOString().slice(0,10),
          address: c.address,
          clientType: c.clientType,
          totalOrders: c.totalOrders ?? 0,
          lastOrderDate: c.lastOrderDate || null,
          notes: c.notes || "",
          rating: c.rating ?? 0,
        }));
        setClients(mapped);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Calculate statistics
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "ACTIVE").length,
    pending: clients.filter(c => c.status === "PENDING").length,
    inactive: clients.filter(c => c.status === "INACTIVE").length,
    totalOrders: clients.reduce((sum, c) => sum + c.totalOrders, 0),
    averageRating: clients.reduce((sum, c) => sum + c.rating, 0) / clients.length || 0
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="w-4 h-4" />;
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "INACTIVE": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INACTIVE": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.id.toLowerCase().includes(search.toLowerCase()) ||
      client.clientType.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesType = clientTypeFilter === "all" || client.clientType === clientTypeFilter;
    
    const matchesDate = (!dateFilter.from || new Date(client.registrationDate) >= new Date(dateFilter.from)) &&
      (!dateFilter.to || new Date(client.registrationDate) <= new Date(dateFilter.to));
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "registrationDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === "totalOrders" || sortField === "rating") {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }
    
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleAdd = () => {
    setEditClient(null);
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditClient(client);
    setShowModal(true);
  };

  const handleSave = async (client) => {
    try {
      if (editClient) {
        const { data } = await apiUpdateClient(editClient.id, client);
        const updated = {
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          registrationDate: data.createdAt?.slice(0,10) || editClient.registrationDate,
          address: data.address,
          clientType: data.clientType,
          totalOrders: data.totalOrders ?? 0,
          lastOrderDate: data.lastOrderDate || null,
          notes: data.notes || "",
          rating: data.rating ?? 0,
        };
        setClients((prev) => prev.map((c) => (c.id === editClient.id ? updated : c)));
      } else {
        const { data } = await apiCreateClient(client);
        const created = {
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          registrationDate: data.createdAt?.slice(0,10) || new Date().toISOString().slice(0,10),
          address: data.address,
          clientType: data.clientType,
          totalOrders: data.totalOrders ?? 0,
          lastOrderDate: data.lastOrderDate || null,
          notes: data.notes || "",
          rating: data.rating ?? 0,
        };
        setClients((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save client. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedClients.length === 0) {
      alert("Please select clients to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedClients.length} client(s)?`)) return;

    try {
      await Promise.all(selectedClients.map((id) => apiDeleteClient(id)));
      setClients(prev => prev.filter(client => !selectedClients.includes(client.id)));
      setSelectedClients([]);
      alert(`Successfully deleted ${selectedClients.length} client(s).`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete some clients. Please try again.");
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedClients.length === 0) {
      alert("Please select clients to update status.");
      return;
    }

    if (!window.confirm(`Are you sure you want to update ${selectedClients.length} client(s) to ${status}?`)) return;

    try {
      setClients(prev => 
        prev.map(client => 
          selectedClients.includes(client.id) 
            ? { ...client, status }
            : client
        )
      );
      setSelectedClients([]);
      alert(`Successfully updated ${selectedClients.length} client(s) to ${status}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to update some clients. Please try again.");
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(client => client.id));
    }
  };

  const handleSelectClient = (id) => {
    setSelectedClients(prev => 
      prev.includes(id) 
        ? prev.filter(clientId => clientId !== id)
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

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleDelete = async (id, skipConfirmation = false) => {
    if (!skipConfirmation && !window.confirm("Are you sure you want to delete this client?")) return;
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await apiDeleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      
      // Remove from selected clients if it was selected
      setSelectedClients(prev => prev.filter(clientId => clientId !== id));
      
      alert("Client deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete client. Please try again.");
      throw err; // Re-throw to allow caller to handle
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setClientTypeFilter("all");
    setDateFilter({ from: "", to: "" });
  };

  const exportToCSV = () => {
    const csvData = filteredClients.map(client => ({
      "Client ID": client.id,
      "Name": client.name,
      "Email": client.email,
      "Phone": client.phone,
      "Status": client.status,
      "Client Type": client.clientType,
      "Registration Date": client.registrationDate,
      "Address": client.address,
      "Total Orders": client.totalOrders,
      "Last Order Date": client.lastOrderDate || "N/A",
      "Rating": client.rating,
      "Notes": client.notes
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleNotes = (client) => {
    setNotesClient(client);
    setShowNotesModal(true);
  };

  const updateNotes = (clientId, notes) => {
    setClients(prev => 
      prev.map(client => 
        client.id === clientId 
          ? { ...client, notes }
          : client
      )
    );
    setShowNotesModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Client Directory</h1>
          </div>
          <p className="text-gray-600">Manage and track your client relationships and interactions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
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
                  placeholder="Search by name, email, ID, or client type..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
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
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
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
                      <option value="ACTIVE">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                    <select
                      value={clientTypeFilter}
                      onChange={(e) => setClientTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="Pharmacy Chain">Pharmacy Chain</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Independent Pharmacy">Independent Pharmacy</option>
                      <option value="Medical Center">Medical Center</option>
                    </select>
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
        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Clients ({filteredClients.length})
              </h3>
              
              {selectedClients.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedClients.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkStatusUpdate("ACTIVE")}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate("INACTIVE")}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Deactivate
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedClients([])}
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
          
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-500 text-center max-w-sm">
                {search || statusFilter !== "all" || clientTypeFilter !== "all" || dateFilter.from || dateFilter.to
                  ? "Try adjusting your search or filter criteria" 
                  : "No clients have been added yet"}
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
                          checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Select All
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center gap-1">
                        Client ID
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
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
                      onClick={() => handleSort("totalOrders")}
                    >
                      <div className="flex items-center gap-1">
                        Orders
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("rating")}
                    >
                      <div className="flex items-center gap-1">
                        Rating
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className={`hover:bg-gray-50 transition-colors ${selectedClients.includes(client.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-6">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleSelectClient(client.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <Building className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{client.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-xs text-gray-500">{client.clientType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                          {getStatusIcon(client.status)}
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{client.totalOrders}</div>
                          <div className="text-xs text-gray-500">orders</div>
                        </div>
                        {client.lastOrderDate && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(client.lastOrderDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">{client.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(client)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          
                          <button
                            onClick={() => handleNotes(client)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Notes
                          </button>
                          
                          <button
                            onClick={() => handleEdit(client)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
                                try {
                                  await handleDelete(client.id, true); // Skip confirmation since we already confirmed
                                } catch (error) {
                                  // Error is already handled in handleDelete
                                }
                              }
                            }}
                            disabled={actionLoading[client.id]}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading[client.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals */}
        {showModal && (
          <ClientModal
            client={editClient}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}

        {/* View Details Modal */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Client Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Client ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedClient.id}</p>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedClient.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedClient.clientType}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedClient.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedClient.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedClient.address}</span>
                  </div>
                </div>

                {/* Status and Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedClient.status)}`}>
                      {getStatusIcon(selectedClient.status)}
                      {selectedClient.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Orders</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{selectedClient.totalOrders}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">{selectedClient.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{new Date(selectedClient.registrationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Order Date</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedClient.lastOrderDate ? new Date(selectedClient.lastOrderDate).toLocaleDateString() : "No orders yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedClient.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-900">{selectedClient.notes}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setEditClient(selectedClient);
                    setShowModal(true);
                    setShowViewModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Client
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to delete "${selectedClient.name}"? This action cannot be undone.`)) {
                      try {
                        await handleDelete(selectedClient.id, true); // Skip confirmation since we already confirmed
                        setShowViewModal(false);
                      } catch (error) {
                        // Error is already handled in handleDelete
                      }
                    }
                  }}
                  disabled={actionLoading[selectedClient.id]}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading[selectedClient.id] ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Client
                </button>
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

        {/* Notes Modal */}
        {showNotesModal && notesClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Client Notes</h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client: {notesClient.name}</label>
                  <textarea
                    value={notesClient.notes}
                    onChange={(e) => {
                      const updatedClient = { ...notesClient, notes: e.target.value };
                      setNotesClient(updatedClient);
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about this client..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateNotes(notesClient.id, notesClient.notes)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(
    client || {
      name: "",
      email: "",
      phone: "",
      status: "ACTIVE",
      clientType: "Independent Pharmacy",
      address: "",
    }
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    // Client Name validation
    if (!form.name.trim()) {
      newErrors.name = "Client name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Client name must be at least 2 characters long.";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Client name must be less than 100 characters.";
    } else if (!/^[A-Za-z0-9\s&.,'-]+$/.test(form.name)) {
      newErrors.name = "Client name contains invalid characters. Only letters, numbers, spaces, and &.,'- are allowed.";
    }
    
    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(form.email)) {
        newErrors.email = "Please enter a valid email address.";
      } else if (form.email.length > 254) {
        newErrors.email = "Email address is too long.";
      }
    }
    
    // Phone validation
    const phone = form.phone.trim();
    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      // Remove all spaces and special characters except + for validation
      const cleanPhone = phone.replace(/[\s-()]/g, '');
      
      // Sri Lankan mobile number validation
      const slRegex = /^(\+94|0)(71|70|77|76|72|78|75)\d{7}$/;
      const repeatedDigits = /(\d)\1{6,}/;
      
      if (!slRegex.test(cleanPhone)) {
        newErrors.phone = "Please enter a valid Sri Lankan mobile number (e.g., +94 77 123 4567 or 077 123 4567).";
      } else if (repeatedDigits.test(cleanPhone)) {
        newErrors.phone = "Phone number cannot have repeated digits.";
      }
    }
    
    // Address validation
    if (!form.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (form.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters long.";
    } else if (form.address.trim().length > 500) {
      newErrors.address = "Address must be less than 500 characters.";
    }
    
    // Client Type validation
    const validClientTypes = ["Independent Pharmacy", "Pharmacy Chain", "Hospital", "Medical Center"];
    if (!form.clientType || !validClientTypes.includes(form.clientType)) {
      newErrors.clientType = "Please select a valid client type.";
    }
    
    // Status validation (optional field, but validate if provided)
    if (form.status && !["ACTIVE", "PENDING", "INACTIVE"].includes(form.status)) {
      newErrors.status = "Please select a valid status.";
    }
    
    return newErrors;
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +94, format as +94 XX XXX XXXX
    if (cleaned.startsWith('+94')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 9) {
        if (digits.length <= 2) return `+94 ${digits}`;
        if (digits.length <= 5) return `+94 ${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
      }
    }
    
    // If it starts with 0, format as 0XX XXX XXXX
    if (cleaned.startsWith('0')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 9) {
        if (digits.length <= 2) return `0${digits}`;
        if (digits.length <= 5) return `0${digits.slice(0, 2)} ${digits.slice(2)}`;
        return `0${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
      }
    }
    
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Format phone number as user types
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
    
    // Real-time validation for specific fields
    if (name === 'email' && processedValue.trim()) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(processedValue)) {
        setErrors({ ...errors, email: "Please enter a valid email address." });
      }
    }
    
    if (name === 'phone' && processedValue.trim()) {
      const cleanPhone = processedValue.replace(/[\s-()]/g, '');
      const slRegex = /^(\+94|0)(71|70|77|76|72|78|75)\d{7}$/;
      if (cleanPhone && !slRegex.test(cleanPhone)) {
        setErrors({ ...errors, phone: "Please enter a valid Sri Lankan mobile number." });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(form);
  };

  // Check if form has any validation errors
  const hasErrors = Object.keys(errors).some(key => errors[key]);
  const isFormValid = form.name.trim() && form.email.trim() && form.phone.trim() && 
                     form.address.trim() && form.clientType && !hasErrors;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {client ? "Edit Client" : "Add New Client"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter client name"
                required
              />
              <div className="flex justify-between items-center mt-1">
                {errors.name ? (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                ) : (
                  <div></div>
                )}
                <p className="text-gray-500 text-xs">
                  {form.name.length}/100
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Type <span className="text-red-500">*</span>
              </label>
              <select
                name="clientType"
                value={form.clientType}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clientType ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="">Select client type</option>
                <option value="Independent Pharmacy">Independent Pharmacy</option>
                <option value="Pharmacy Chain">Pharmacy Chain</option>
                <option value="Hospital">Hospital</option>
                <option value="Medical Center">Medical Center</option>
              </select>
              {errors.clientType && (
                <p className="text-red-500 text-sm mt-1">{errors.clientType}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter email address"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="+94 77 123 4567"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.address ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter complete address"
              required
            />
            <div className="flex justify-between items-center mt-1">
              {errors.address ? (
                <p className="text-red-500 text-sm">{errors.address}</p>
              ) : (
                <div></div>
              )}
              <p className="text-gray-500 text-xs">
                {form.address.length}/500
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.status ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-6 py-2 text-sm font-medium text-white border rounded-lg transition-colors ${
                isFormValid
                  ? "bg-blue-600 border-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 border-gray-400 cursor-not-allowed"
              }`}
            >
              {client ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}