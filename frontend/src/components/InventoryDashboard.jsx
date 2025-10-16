import { useState, useEffect } from "react";
import { 
  User, 
  Home, 
  Boxes, 
  ClipboardList, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Package,
  Activity,
  Bell,
  Settings,
  Menu,
  X
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import InventoryManagerProfile from "./InventoryManagerProfile";
import InventoryManament from "./InventoryManament";
import InventoryReuqestManagement from "./InventoryReuqestManagement";
import InvoicesSentBySupplier from "./InvoicesSentBySupplier";
import CreateInventory from "./CreateInventory";
import { getAllInventoryItems, getLowStockItems } from "../apis/inventoryApi";
import { getAllInventoryRequests } from "../apis/inventoryRequestApi";

const InventoryDashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [notificationItems, setNotificationItems] = useState([
    { id: "n1", type: "inventory", title: "New item added", detail: "Paracetamol 500mg", read: false, time: "2m" },
    { id: "n2", type: "alert", title: "Low stock", detail: "Aspirin 100mg", read: false, time: "5m" },
    { id: "n3", type: "request", title: "Request approved", detail: "Request #1234", read: false, time: "10m" },
  ]);
  const [realTimeData, setRealTimeData] = useState({
    totalItems: 1247,
    lowStock: 23,
    pendingRequests: 8,
    totalValue: 125000
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "Light";
  });
  const [reportType, setReportType] = useState("Inventory Summary");
  const [reportDateRange, setReportDateRange] = useState("Last 7 days");
  const [reportFormat, setReportFormat] = useState("PDF");
  const [recentActivities, setRecentActivities] = useState([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        totalItems: prev.totalItems + Math.floor(Math.random() * 3) - 1,
        lowStock: Math.max(0, prev.lowStock + Math.floor(Math.random() * 3) - 1),
        pendingRequests: Math.max(0, prev.pendingRequests + Math.floor(Math.random() * 3) - 1),
        totalValue: prev.totalValue + Math.floor(Math.random() * 1000) - 500
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Load real recent activities + update summary cards from API
  const loadActivities = async () => {
    try {
      const [invRes, reqRes, lowRes] = await Promise.all([
        getAllInventoryItems(""),
        getAllInventoryRequests(""),
        getLowStockItems(10),
      ]);

      const items = Array.isArray(invRes?.data) ? invRes.data : [];
      const requests = Array.isArray(reqRes?.data) ? reqRes.data : [];
      const lowStock = Array.isArray(lowRes?.data) ? lowRes.data : [];

      const newestItem = items
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const latestApproved = requests
        .filter((r) => r.status === "approved")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
      const firstLow = lowStock[0];

      const activities = [];
      if (newestItem) {
        activities.push({
          id: `inv-${newestItem._id}`,
          type: "inventory",
          title: "New inventory item added",
          detail: `${newestItem.itemName}`,
          time: newestItem.createdAt,
          badge: { text: "Completed", color: "green" },
        });
      }
      if (firstLow) {
        activities.push({
          id: `low-${firstLow._id}`,
          type: "alert",
          title: "Low stock alert",
          detail: `${firstLow.itemName}`,
          time: firstLow.updatedAt || firstLow.createdAt,
          badge: { text: "Warning", color: "yellow" },
        });
      }
      if (latestApproved) {
        activities.push({
          id: `req-${latestApproved._id}`,
          type: "request",
          title: "Request approved",
          detail: `Medicine request #${latestApproved._id.slice(-4)}`,
          time: latestApproved.updatedAt || latestApproved.createdAt,
          badge: { text: "Approved", color: "green" },
        });
      }

      setRecentActivities(activities);

      // Update summary numbers
      const totalValue = items.reduce((sum, i) => sum + Number(i.price || 0), 0);
      setRealTimeData({
        totalItems: items.length,
        lowStock: lowStock.length,
        pendingRequests: requests.filter((r) => r.status === "sent").length,
        totalValue,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const formatTimeAgo = (iso) => {
    try {
      const diff = Date.now() - new Date(iso).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "just now";
      if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
      const d = Math.floor(h / 24);
      return `${d} day${d === 1 ? "" : "s"} ago`;
    } catch {
      return "";
    }
  };

  // Event handlers
  useEffect(() => {
    const applyTheme = (t) => {
      const body = document.body;
      if (t === "Dark") {
        body.style.backgroundColor = "#0f172a";
        body.style.color = "#e5e7eb";
        document.documentElement.setAttribute("data-theme", "dark");
      } else if (t === "System") {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          body.style.backgroundColor = "#0f172a";
          body.style.color = "#e5e7eb";
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          body.style.backgroundColor = "#f8fafc";
          body.style.color = "#111827";
          document.documentElement.setAttribute("data-theme", "light");
        }
      } else {
        body.style.backgroundColor = "#f8fafc";
        body.style.color = "#111827";
        document.documentElement.setAttribute("data-theme", "light");
      }
    };
    applyTheme(theme);
  }, [theme]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadActivities();
    setIsRefreshing(false);
  };

  const handleAddNewItem = () => {
    setShowAddItemModal(true);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
    console.log("Opening Generate Report modal");
  };

  const downloadCsv = (filename, headers, rows, prefaceLines = []) => {
    const escape = (val) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
      return str;
    };
    const csv = [
      ...prefaceLines,
      headers.map(escape).join(","),
      ...rows.map((r) => r.map(escape).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const generateInventoryReport = async () => {
    let rows = [];
    let title = reportType;
    try {
      if (reportType === "Requests Summary") {
        const { data } = await getAllInventoryRequests("");
        const requests = Array.isArray(data) ? data : [];

        const total = requests.length;
        const approved = requests.filter((r) => r.status === "approved").length;
        const sent = requests.filter((r) => r.status === "sent").length;
        const ignored = requests.filter((r) => r.status === "ignored").length;
        const headers = ["Request ID", "Status", "Created", "Total Qty", "First Item"];
        const body = requests.map((req) => [
          req._id,
          req.status,
          new Date(req.createdAt).toLocaleDateString(),
          Array.isArray(req.medicines) ? req.medicines.reduce((n, m) => n + (m.quantity || 0), 0) : 0,
          (Array.isArray(req.medicines) && req.medicines[0]) ? req.medicines[0].medicineName : "-",
        ]);

        if (reportFormat === "Excel") {
          const preface = [
            `Requests Summary`,
            `Generated on:,${new Date().toLocaleString()}`,
            `Date Range:,${reportDateRange}`,
            `Totals:,Total ${total},Approved ${approved},Sent ${sent},Ignored ${ignored}`,
            "",
          ];
          downloadCsv("requests_summary", headers, body, preface);
        } else {
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text("Requests Summary", 14, 20);
          doc.setFontSize(11);
          doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
          doc.text(`Date Range: ${reportDateRange}`, 14, 34);
          doc.text(`Total: ${total}  |  Approved: ${approved}  |  Sent: ${sent}  |  Ignored: ${ignored}`, 14, 40);

          autoTable(doc, {
            head: [headers],
            body,
            startY: 48,
            theme: "grid",
            styles: { fontSize: 9 },
            headStyles: { fillColor: [30, 41, 59] },
          });

          doc.save("requests_summary.pdf");
        }
        return;
      } else {
        const { data } = await getAllInventoryItems("");
        rows = (data || []).map((item) => [
          item.itemName,
          item.itemCode,
          item.inStockQuantity,
          `$${Number(item.price).toFixed(2)}`,
          item.supplierEmail,
          item.expireDate ? new Date(item.expireDate).toLocaleDateString() : "N/A",
        ]);
      }

      const headers = ["Item Name", "Code", "Stock", "Price", "Supplier", "Expiry"];
      if (reportFormat === "Excel") {
        const preface = [
          `${title}`,
          `Generated on:,${new Date().toLocaleString()}`,
          `Date Range:,${reportDateRange}`,
          "",
        ];
        downloadCsv(title.replace(/\s+/g, '_').toLowerCase(), headers, rows, preface);
      } else {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(title, 14, 20);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Date Range: ${reportDateRange}`, 14, 34);

        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: 40,
          theme: "grid",
          styles: { fontSize: 9 },
          headStyles: { fillColor: [30, 41, 59] },
        });

        doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate report. Please try again.");
    }
  };

  const handleManageUsers = () => {
    setShowUserModal(true);
    console.log("Opening User Management modal");
  };

  const handleBellClick = () => {
    setShowNotificationsPanel((prev) => !prev);
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleActivityClick = (activityType, activityId) => {
    console.log(`Clicked on ${activityType} activity: ${activityId}`);
    alert(`Viewing ${activityType} details for ID: ${activityId}`);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardOverview />;
      case "inventory":
        return <InventoryManament triggerAddItem={showAddItemModal} onAddItemClose={() => setShowAddItemModal(false)} />;
      case "requests":
        return <InventoryReuqestManagement />;
      case "invoices":
        return <InvoicesSentBySupplier />;
      case "profile":
        return <InventoryManagerProfile />;
      default:
        return <DashboardOverview />;
    }
  };

  const DashboardOverview = () => {
    const summaryCards = [
      {
        title: "Available Products",
        value: realTimeData.totalItems,
        subtitle: "Items in stock",
        change: "+12%",
        changeType: "positive",
        border: "border-blue-400",
        text: "text-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
        icon: Package,
        iconColor: "text-blue-600"
      },
      {
        title: "Sent Requests",
        value: realTimeData.lowStock,
        subtitle: "Requests sent",
        change: "+3",
        changeType: "negative",
        border: "border-red-400",
        text: "text-red-600",
        bgGradient: "from-red-50 to-red-100",
        icon: AlertTriangle,
        iconColor: "text-red-600"
      },
      {
        title: "Pending Requests",
        value: realTimeData.pendingRequests,
        subtitle: "Awaiting approval",
        change: "-2",
        changeType: "positive",
        border: "border-yellow-400",
        text: "text-yellow-600",
        bgGradient: "from-yellow-50 to-yellow-100",
        icon: Clock,
        iconColor: "text-yellow-600"
      },
      {
        title: "Approved Requests",
        value: realTimeData.totalValue,
        subtitle: "Requests approved",
        change: "+8.5%",
        changeType: "positive",
        border: "border-green-400",
        text: "text-green-600",
        bgGradient: "from-green-50 to-green-100",
        icon: DollarSign,
        iconColor: "text-green-600"
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 text-xl font-medium">Welcome back! Here's what's happening with your inventory.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-white bg-opacity-70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 border-opacity-50 shadow-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Live Data</span>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isRefreshing ? (
                  <>
                    <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Refreshing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className={`relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl border-l-4 ${card.border} p-6 transform hover:scale-105 transition-all duration-300 group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.bgGradient} opacity-10 rounded-bl-full transform translate-x-6 -translate-y-6`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.bgGradient} ${card.iconColor} shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {card.changeType === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        card.changeType === "positive" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                      }`}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {card.value.toLocaleString()}
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{card.subtitle}</p>
                  </div>
                </div>
                
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-blue-600" />
                Quick Actions
              </h3>
              <p className="text-gray-600">Streamline your workflow with these essential tools</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={handleAddNewItem}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex flex-col items-center space-y-4 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-bl-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative z-10 p-4 bg-white bg-opacity-30 rounded-2xl shadow-lg backdrop-blur-sm border border-white border-opacity-20">
                <Package className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <span className="font-bold text-xl text-white drop-shadow-sm">Add Item</span>
                <p className="text-blue-100 text-sm mt-2 font-medium">Create new inventory</p>
              </div>
            </button>
            <button 
              onClick={handleGenerateReport}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex flex-col items-center space-y-4 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-bl-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative z-10 p-4 bg-white bg-opacity-30 rounded-2xl shadow-lg backdrop-blur-sm border border-white border-opacity-20">
                <FileText className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <span className="font-bold text-xl text-white drop-shadow-sm">Generate Report</span>
                <p className="text-green-100 text-sm mt-2 font-medium">Export analytics</p>
              </div>
            </button>
            <button 
              onClick={handleManageUsers}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex flex-col items-center space-y-4 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-bl-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative z-10 p-4 bg-white bg-opacity-30 rounded-2xl shadow-lg backdrop-blur-sm border border-white border-opacity-20">
                <User className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="relative z-10 text-center">
                <span className="font-bold text-xl text-white drop-shadow-sm">Manage Users</span>
                <p className="text-purple-100 text-sm mt-2 font-medium">User administration</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-blue-600" />
                Recent Activity
              </h3>
              <p className="text-gray-600">Latest updates and changes in your inventory</p>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm">Activity will appear here as you use the system</p>
              </div>
            ) : (
              recentActivities.map((a, index) => (
                <div
                  key={a.id}
                  onClick={() => handleActivityClick(a.type, a.id)}
                  className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-blue-100 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${a.type === 'alert' ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' : a.type === 'request' ? 'bg-gradient-to-br from-green-400 to-green-500 text-white' : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white'}`}>
                    {a.type === 'alert' ? (
                      <AlertTriangle className="h-6 w-6" />
                    ) : a.type === 'request' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Package className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{a.title}</p>
                    <p className="text-sm text-gray-600 truncate">{a.detail} - {formatTimeAgo(a.time)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${a.badge.color === 'green' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                      {a.badge.text}
                    </span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal Components
  const AddItemModal = () => {
    if (!showAddItemModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Add Item</h3>
            <button 
              onClick={() => setShowAddItemModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <CreateInventory onClose={() => setShowAddItemModal(false)} />
        </div>
      </div>
    );
  };

  const ReportModal = () => {
    if (!showReportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Generate Report</h3>
            <button 
              onClick={() => setShowReportModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="Inventory Summary">Inventory Summary</option>
                <option value="Requests Summary">Requests Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select value={reportDateRange} onChange={(e) => setReportDateRange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="All time">All time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select value={reportFormat} onChange={(e) => setReportFormat(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await generateInventoryReport();
                  setShowReportModal(false);
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserModal = () => {
    if (!showUserModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
            <button 
              onClick={() => setShowUserModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">User Management</h4>
              <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium">Add New User</div>
                <div className="text-sm text-gray-500">Create a new user account</div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium">Manage Permissions</div>
                <div className="text-sm text-gray-500">Update user roles and access</div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium">View All Users</div>
                <div className="text-sm text-gray-500">Browse and edit user accounts</div>
              </button>
            </div>
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => setShowUserModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert("Navigating to user management...");
                  setShowUserModal(false);
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Open Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  const isDarkTheme = (() => {
    if (theme === "Dark") return true;
    if (theme === "System") {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  })();

  return (
    <div className={isDarkTheme ? "flex h-screen bg-slate-900 text-gray-100" : "flex h-screen bg-gray-50"}>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Inventory Portal</h1>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`sidebar-hover flex items-center justify-between w-full px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                  activePage === item.id
                    ? "bg-blue-600 text-white shadow-lg transform scale-105 glow-effect"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-105"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {activePage === item.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Dumindu Liyanaarachchi</p>
              <p className="text-xs text-gray-400 truncate">dumindu.liyanaarachchi@example.lk</p>
            </div>
            <button onClick={handleSettingsClick} className="p-1 rounded hover:bg-gray-600 transition-colors" title="Profile settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={isDarkTheme ? "bg-slate-800 shadow-sm border-b border-slate-700 px-6 py-4" : "bg-white shadow-sm border-b border-gray-200 px-6 py-4"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className={isDarkTheme ? "lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors" : "lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className={isDarkTheme ? "text-2xl font-semibold text-gray-100 capitalize" : "text-2xl font-semibold text-gray-900 capitalize"}>
                  {activePage === "dashboard" ? "Dashboard Overview" : activePage}
                </h2>
                <p className={isDarkTheme ? "text-sm text-gray-300" : "text-sm text-gray-500"}>
                  {activePage === "dashboard" 
                    ? "Welcome back! Here's what's happening with your inventory."
                    : `Manage your ${activePage} efficiently`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={handleBellClick} className={isDarkTheme ? "relative p-2 rounded-lg hover:bg-slate-700 transition-colors" : "relative p-2 rounded-lg hover:bg-gray-100 transition-colors"}>
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>
              <button onClick={handleSettingsClick} className={isDarkTheme ? "p-2 rounded-lg hover:bg-slate-700 transition-colors" : "p-2 rounded-lg hover:bg-gray-100 transition-colors"}>
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      <>
        <AddItemModal />
        <ReportModal />
        <UserModal />
      </>
      
      {showNotificationsPanel && (
        <div className="fixed inset-0 z-50" onClick={() => setShowNotificationsPanel(false)}>
          <div className="absolute right-6 top-16 bg-white border border-gray-200 rounded-xl shadow-xl w-96 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Notifications</h4>
              <button onClick={() => setShowNotificationsPanel(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  setNotificationItems((prev) => prev.map((n) => ({ ...n, read: true })));
                  setNotifications(0);
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Mark all as read
              </button>
              <button
                onClick={() => {
                  setNotificationItems([]);
                  setNotifications(0);
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {notificationItems.length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center">No notifications</div>
              ) : (
                notificationItems.map((n) => (
                  <div key={n.id} className={`py-3 flex items-start gap-3 ${n.read ? 'bg-white' : 'bg-blue-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{n.title}</p>
                        <span className="text-xs text-gray-500 ml-2">{n.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{n.detail}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => {
                          setNotificationItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
                          const remaining = notificationItems.filter((x) => !x.read && x.id !== n.id).length;
                          setNotifications(Math.max(0, remaining));
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates by email</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Sound</p>
                  <p className="text-sm text-gray-500">Play a sound for alerts</p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </div>
            <div className="flex gap-3 pt-5 justify-end">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => { localStorage.setItem('theme', theme); setShowSettingsModal(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
