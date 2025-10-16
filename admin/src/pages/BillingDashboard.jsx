import React, { useState, useEffect, useCallback } from "react";
import InvoicePage from "./InvoicePage";
import ExpensePage from "./ExpensePage";
import EmployeePaymentPage from "./EmployeePaymentPage";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../services/invoiceService";
import { getExpenses } from "../services/expenseService";
import { getEmployeePayments } from "../services/employeePaymentService";

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    employeePayments: 0,
    netProfit: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Generate recent activity from actual data
  const generateRecentActivity = useCallback((invoices, expenses, payments) => {
    const activities = [];

    // Add recent invoices (last 3)
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    recentInvoices.forEach(inv => {
      activities.push({
        type: 'invoice',
        desc: `Invoice ${inv.id} created for ${inv.patientId}`,
        amount: inv.total,
        time: formatTimeAgo(new Date(inv.date)),
        date: new Date(inv.date),
        color: 'blue',
        icon: '🧾',
        status: inv.status
      });
    });

    // Add recent expenses (last 3)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    recentExpenses.forEach(exp => {
      activities.push({
        type: 'expense',
        desc: `Expense: ${exp.title}`,
        amount: exp.amount,
        time: formatTimeAgo(new Date(exp.date)),
        date: new Date(exp.date),
        color: 'red',
        icon: '💸',
        category: exp.category
      });
    });

    // Add recent payments (last 3)
    const recentPayments = payments
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 3);
    
    recentPayments.forEach(pay => {
      activities.push({
        type: 'payment',
        desc: `Payment to ${pay.employeeName} (${pay.employeeId})`,
        amount: pay.totalSalary,
        time: formatTimeAgo(new Date(pay.paymentDate)),
        date: new Date(pay.paymentDate),
        color: 'green',
        icon: '💰',
        status: pay.status
      });
    });

    // Sort all activities by date (most recent first) and take top 10
    const sortedActivities = activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    return sortedActivities;
  }, []);

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  // Fetch real data and calculate stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [invoicesRes, expensesRes, paymentsRes] = await Promise.all([
        getInvoices(),
        getExpenses(),
        getEmployeePayments()
      ]);

      // Handle different response structures correctly
      const invoices = invoicesRes.data?.invoices || [];
      const expenses = Array.isArray(expensesRes.data) ? expensesRes.data : [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

      console.log("Dashboard - Invoices:", invoices);
      console.log("Dashboard - Expenses:", expenses);
      console.log("Dashboard - Payments:", payments);

      // Calculate totals
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      const totalExpenses = expenses
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const employeePayments = payments
        .filter(pay => pay.status === 'paid')
        .reduce((sum, pay) => sum + (pay.totalSalary || 0), 0);

      const netProfit = totalRevenue - totalExpenses - employeePayments;

      setStats({
        totalRevenue,
        totalExpenses,
        employeePayments,
        netProfit
      });

      // Generate recent activity
      const activities = generateRecentActivity(invoices, expenses, payments);
      setRecentActivity(activities);

    } catch (error) {
      console.error("Error fetching stats:", error);
      setRecentActivity([{
        type: 'error',
        desc: 'Failed to load recent activity',
        time: 'Now',
        color: 'red',
        icon: '⚠️'
      }]);
    } finally {
      setLoading(false);
    }
  }, [generateRecentActivity]);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetch stats when tab changes back to dashboard
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab, fetchStats]);

  const statsCards = [
    { 
      title: "Total Revenue", 
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`, 
      icon: "💰", 
      color: "from-green-400 to-emerald-600", 
      shadow: "shadow-green-500/50"
    },
    { 
      title: "Total Expenses", 
      value: `Rs. ${stats.totalExpenses.toLocaleString()}`, 
      icon: "💳", 
      color: "from-red-400 to-rose-600", 
      shadow: "shadow-red-500/50"
    },
    { 
      title: "Employee Payments", 
      value: `Rs. ${stats.employeePayments.toLocaleString()}`, 
      icon: "👥", 
      color: "from-blue-400 to-indigo-600", 
      shadow: "shadow-blue-500/50"
    },
    { 
      title: "Net Profit", 
      value: `Rs. ${stats.netProfit.toLocaleString()}`, 
      icon: "📊", 
      color: stats.netProfit >= 0 ? "from-purple-400 to-violet-600" : "from-red-400 to-rose-600", 
      shadow: stats.netProfit >= 0 ? "shadow-purple-500/50" : "shadow-red-500/50"
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`absolute rounded-full ${darkMode ? 'bg-purple-500/10' : 'bg-blue-400/10'} animate-float`}
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 transform hover:scale-[1.02] transition-transform duration-300">
          <div className={`${darkMode ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl'} rounded-3xl p-8 shadow-2xl border ${darkMode ? 'border-purple-500/20' : 'border-white/50'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className={`text-5xl font-black ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'} drop-shadow-lg mb-2`}>
                  MediCura Billing
                </h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg font-medium`}>Advanced Financial Management System</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate("/billing")}
                  className={`px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white' : 'bg-gradient-to-r from-green-500 to-teal-500 text-white'}`}>
                  💳 Make Payment
                </button>
                <button onClick={fetchStats}
                  className={`px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'}`}>
                  🔄 Refresh
                </button>
                <button onClick={() => setDarkMode(!darkMode)}
                  className={`px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}>
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-4 min-w-max p-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'invoices', label: 'Invoices', icon: '🧾' },
              { id: 'expenses', label: 'Expenses', icon: '💸' },
              { id: 'payments', label: 'Payments', icon: '💰' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transform transition-all duration-300 hover:scale-110 ${
                  activeTab === tab.id
                    ? `${darkMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'} shadow-2xl shadow-purple-500/50 scale-110`
                    : `${darkMode ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' : 'bg-white/50 text-gray-700 hover:bg-white/80'} shadow-lg`
                }`}>
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Loading stats...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, idx) => (
                  <div key={idx}
                    className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-6 shadow-2xl border transform hover:scale-105 hover:-rotate-1 transition-all duration-300 ${stat.shadow}`}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl mb-4 shadow-lg transform hover:rotate-12 transition-transform`}>
                      {stat.icon}
                    </div>
                    <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-semibold mb-2`}>{stat.title}</h3>
                    <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-3xl font-black mb-2`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setActiveTab('invoices')}
                className={`${darkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 hover:from-blue-800/60 hover:to-indigo-800/60' : 'bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200'} backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${darkMode ? 'border-blue-500/20' : 'border-blue-300/50'} transform hover:scale-105 transition-all duration-300`}>
                <div className="text-5xl mb-4">🧾</div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Manage Invoices</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create and track patient invoices</p>
              </button>
              <button onClick={() => setActiveTab('expenses')}
                className={`${darkMode ? 'bg-gradient-to-br from-red-900/50 to-rose-900/50 hover:from-red-800/60 hover:to-rose-800/60' : 'bg-gradient-to-br from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200'} backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${darkMode ? 'border-red-500/20' : 'border-red-300/50'} transform hover:scale-105 transition-all duration-300`}>
                <div className="text-5xl mb-4">💸</div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Track Expenses</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor all business expenses</p>
              </button>
              <button onClick={() => setActiveTab('payments')}
                className={`${darkMode ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 hover:from-green-800/60 hover:to-emerald-800/60' : 'bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200'} backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${darkMode ? 'border-green-500/20' : 'border-green-300/50'} transform hover:scale-105 transition-all duration-300`}>
                <div className="text-5xl mb-4">💰</div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employee Payments</h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Process staff salaries</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
                {recentActivity.length > 0 && (
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last {recentActivity.length} activities
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Loading recent activity...
                  </div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📭</span>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No recent activity found
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                    Start by creating invoices, expenses, or payments
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer transform hover:scale-[1.02]`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${activity.color}-400 to-${activity.color}-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                          {activity.desc}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {activity.time}
                          </p>
                          {activity.amount && (
                            <span className={`text-sm font-bold ${
                              activity.type === 'expense' 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              • Rs. {activity.amount.toLocaleString()}
                            </span>
                          )}
                          {activity.status && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              activity.status === 'paid' ? 'bg-green-100 text-green-800' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && <InvoicePage darkMode={darkMode} onUpdate={fetchStats} />}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && <ExpensePage darkMode={darkMode} onUpdate={fetchStats} />}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <EmployeePaymentPage darkMode={darkMode} onUpdate={fetchStats} />
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => navigate("/payment-analysis")}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                📈 View Analytics
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float { animation: float linear infinite; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default BillingDashboard;