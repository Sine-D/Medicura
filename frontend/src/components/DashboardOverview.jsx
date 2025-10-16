
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInventoryRequests } from "../apis/inventoryRequestApi";
import { getAllInventoryInvoices } from "../apis/inventoryInvoiceApi";

// This will be updated dynamically based on real data
const getSummaryCards = (stats) => [
  {
    title: "Request Management",
    value: stats.totalRequests,
    subtitle: "Total requests",
    border: "border-blue-400",
    text: "text-blue-600",
  },
  {
    title: "Invoice Management",
    value: stats.totalInvoices,
    subtitle: "Total invoices",
    border: "border-green-400",
    text: "text-green-600",
  },
  {
    title: "Pending Requests",
    value: stats.pendingRequests,
    subtitle: "Awaiting approval",
    border: "border-yellow-400",
    text: "text-yellow-600",
  },
  {
    title: "Approved Requests",
    value: stats.approvedRequests,
    subtitle: "Completed requests",
    border: "border-green-400",
    text: "text-green-600",
  },
  {
    title: "Sent Invoices",
    value: stats.sentInvoices,
    subtitle: "Invoices sent",
    border: "border-blue-400",
    text: "text-blue-600",
  },
  {
    title: "Approved Invoices",
    value: stats.approvedInvoices,
    subtitle: "Invoices approved",
    border: "border-green-400",
    text: "text-green-600",
  },
];

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [searchRequest, setSearchRequest] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [invoiceRequests, setInvoiceRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalInvoices: 0,
    sentInvoices: 0,
    approvedInvoices: 0
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch inventory requests
        const requestsResponse = await getAllInventoryRequests();
        const requestsData = requestsResponse.data || [];
        
        // Transform requests data to match the expected format
        const transformedRequests = requestsData.map(request => ({
          id: request._id,
          medicine: request.medicines?.[0]?.medicineName || "Multiple items",
          message: request.message || "-",
          created: new Date(request.createdAt).toLocaleDateString(),
          status: request.status?.toUpperCase() || "PENDING"
        }));
        
        setInvoiceRequests(transformedRequests);
        
        // Calculate stats
        const totalRequests = transformedRequests.length;
        const pendingRequests = transformedRequests.filter(r => r.status === "SENT").length;
        const approvedRequests = transformedRequests.filter(r => r.status === "APPROVED").length;
        
        // Try to fetch invoices (if API exists)
        try {
          const invoicesResponse = await getAllInventoryInvoices();
          const invoicesData = invoicesResponse.data || [];
          
          const transformedInvoices = invoicesData.map(invoice => {
            // Calculate total amount from items
            const totalAmount = invoice.items?.reduce((sum, item) => {
              return sum + (item.price * item.quantity);
            }, 0) || 0;
            
            // Create items display text
            let itemsDisplay;
            if (!invoice.items || invoice.items.length === 0) {
              itemsDisplay = "No items";
            } else if (invoice.items.length === 1) {
              itemsDisplay = invoice.items[0].name;
            } else {
              itemsDisplay = `${invoice.items[0].name} +${invoice.items.length - 1} more`;
            }
            
            return {
              id: invoice._id,
              items: itemsDisplay,
              status: invoice.status?.toUpperCase() || "PENDING",
              total: totalAmount.toFixed(2),
              created: new Date(invoice.createdAt).toLocaleDateString(),
              itemCount: invoice.items?.length || 0,
              itemDetails: invoice.items || []
            };
          });
          
          setInvoices(transformedInvoices);
          
          // Calculate invoice statistics
          const totalInvoices = transformedInvoices.length;
          const sentInvoices = transformedInvoices.filter(inv => inv.status === "PENDING").length;
          const approvedInvoices = transformedInvoices.filter(inv => inv.status === "APPROVED").length;
          
          setStats({
            totalRequests,
            pendingRequests,
            approvedRequests,
            totalInvoices,
            sentInvoices,
            approvedInvoices
          });
          
        } catch (invoiceError) {
          console.log("Invoice API not available, using sample data");
          // Provide sample data with proper amounts for demonstration
          const sampleInvoices = [
            {
              id: "sample1",
              items: "Cetrazine",
              status: "APPROVED",
              total: "20.00",
              created: "10/2/2025",
              itemCount: 1,
              itemDetails: [{ name: "Cetrazine", price: 1.00, quantity: 20 }]
            },
            {
              id: "sample2", 
              items: "Rapisol",
              status: "PENDING",
              total: "200.00",
              created: "10/2/2025",
              itemCount: 1,
              itemDetails: [{ name: "Rapisol", price: 1.00, quantity: 200 }]
            },
            {
              id: "sample3",
              items: "panadol",
              status: "CANCELLED", 
              total: "120.00",
              created: "10/1/2025",
              itemCount: 1,
              itemDetails: [{ name: "panadol", price: 1.00, quantity: 120 }]
            },
            {
              id: "sample4",
              items: "Iodex",
              status: "APPROVED",
              total: "400.00", 
              created: "9/30/2025",
              itemCount: 1,
              itemDetails: [{ name: "Iodex", price: 2.00, quantity: 200 }]
            },
            {
              id: "sample5",
              items: "Panadol",
              status: "PENDING",
              total: "10.00",
              created: "9/30/2025", 
              itemCount: 1,
              itemDetails: [{ name: "Panadol", price: 1.00, quantity: 10 }]
            }
          ];
          
          setInvoices(sampleInvoices);
          
          // Calculate sample invoice statistics
          const totalInvoices = sampleInvoices.length;
          const sentInvoices = sampleInvoices.filter(inv => inv.status === "PENDING").length;
          const approvedInvoices = sampleInvoices.filter(inv => inv.status === "APPROVED").length;
          
          setStats({
            totalRequests,
            pendingRequests,
            approvedRequests,
            totalInvoices,
            sentInvoices,
            approvedInvoices
          });
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Keep default empty arrays if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter for recent activities (last 7 days) and search
  const getRecentRequests = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return invoiceRequests
      .filter((r) => {
        // Filter by search term
        const matchesSearch = r.medicine.toLowerCase().includes(searchRequest.toLowerCase()) ||
                             r.message.toLowerCase().includes(searchRequest.toLowerCase());
        
        // Filter by recent date (last 7 days)
        const requestDate = new Date(r.created);
        const isRecent = requestDate >= sevenDaysAgo;
        
        return matchesSearch && isRecent;
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created)) // Sort by newest first
      .slice(0, 10); // Limit to 10 most recent
  };

  const filteredRequests = getRecentRequests();
  
  // Filter for recent invoice activities (last 7 days) and search
  const getRecentInvoices = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return invoices
      .filter((i) => {
        // Filter by search term
        const matchesSearch = i.items.toLowerCase().includes(searchInvoice.toLowerCase());
        
        // Filter by recent date (last 7 days)
        const invoiceDate = new Date(i.created);
        const isRecent = invoiceDate >= sevenDaysAgo;
        
        return matchesSearch && isRecent;
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created)) // Sort by newest first
      .slice(0, 10); // Limit to 10 most recent
  };

  const filteredInvoices = getRecentInvoices();

  const handleSearchRequest = () => {
    // Navigate to requests page with search term
    navigate('/supplier-dashboard?tab=requests&search=' + encodeURIComponent(searchRequest));
  };

  const handleSearchInvoice = () => {
    // Navigate to invoices page with search term
    navigate('/supplier-dashboard?tab=invoices&search=' + encodeURIComponent(searchInvoice));
  };

  const handleCreateInvoice = () => {
    // Navigate to invoices page and trigger create modal
    navigate('/supplier-dashboard?tab=invoices&action=create');
  };

  const handleViewInvoice = (invoice) => {
    // Navigate to invoice details or show modal
    alert(`Viewing invoice: ${invoice.items} - Total: $${invoice.total}`);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-2">Dashboard Overview</h2>
      <hr className="mb-4" />
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Manage your dashboard efficiently</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {getSummaryCards(stats).map((card) => (
            <div
              key={card.title}
              className={`bg-white rounded-lg shadow border-t-4 ${card.border} p-4 flex flex-col justify-between`}
            >
              <div className={`font-semibold ${card.text}`}>{card.title}</div>
              <div className="text-3xl font-bold mt-2 mb-1">
                {loading ? "..." : card.value}
              </div>
              <div className="text-gray-500 text-sm">{card.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Recent Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Activities from the last 7 days</p>
          </div>
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="w-full max-w-xs border rounded px-3 py-2 mr-2"
            placeholder="Search medicine..."
            value={searchRequest}
            onChange={(e) => setSearchRequest(e.target.value)}
          />
          <button 
            onClick={handleSearchRequest}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">MEDICINE</th>
              <th className="py-2 px-4">MESSAGE</th>
              <th className="py-2 px-4">CREATED</th>
              <th className="py-2 px-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No recent requests found in the last 7 days.
                </td>
              </tr>
            ) : (
              filteredRequests.map((r, idx) => (
                <tr key={r.id || idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.medicine}</td>
                  <td className="py-3 px-4 text-gray-600">{r.message}</td>
                  <td className="py-3 px-4 text-gray-600">{r.created}</td>
                  <td className="py-3 px-4">
                    {r.status === "APPROVED" ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">APPROVED</span>
                    ) : r.status === "SENT" ? (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">PENDING</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{r.status}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
            <p className="text-sm text-gray-500 mt-1">Activities from the last 7 days</p>
          </div>
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="w-full max-w-xs border rounded px-3 py-2 mr-2"
            placeholder="Search medicine..."
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
          />
          <button 
            onClick={handleSearchInvoice}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">ITEMS</th>
              <th className="py-2 px-4">STATUS</th>
              <th className="py-2 px-4">TOTAL (£)</th>
              <th className="py-2 px-4">CREATED</th>
              <th className="py-2 px-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Loading invoices...
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No recent invoices found in the last 7 days.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((i, idx) => (
                <tr key={i.id || idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{i.items}</td>
                  <td className="py-3 px-4">
                  {i.status === "APPROVED" ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">APPROVED</span>
                    ) : i.status === "CANCELLED" ? (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">CANCELLED</span>
                  ) : (
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">PENDING</span>
                  )}
                </td>
                  <td className="py-3 px-4 font-medium">£{i.total}</td>
                  <td className="py-3 px-4 text-gray-600">{i.created}</td>
                  <td className="py-3 px-4">
                  <button 
                    onClick={() => handleViewInvoice(i)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleCreateInvoice}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            + Create New Invoice
          </button>
        </div>
      </div>
    </div>
  );
}