import React, { useEffect, useState } from "react";
import { getEmployeePayments } from "../services/employeePaymentService";
import { getExpenses } from "../services/expenseService";
import { getInvoices } from "../services/invoiceService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";

const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PaymentAnalysisPage = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b'];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getEmployeePayments();
        const payments = response.data || [];

        const grouped = {};
        payments.forEach((p) => {
          const month = new Date(p.paymentDate).toLocaleString("default", { month: "short" });
          grouped[month] = (grouped[month] || 0) + Number(p.totalSalary || 0);
        });

        const formatted = monthOrder
          .filter((m) => grouped[m] !== undefined)
          .map((m) => ({ month: m, totalSalary: grouped[m] }));
        setPaymentData(formatted);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setPaymentData([]);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await getExpenses();
        const expenses = response.data || [];

        const grouped = {};
        expenses.forEach((e) => {
          const month = new Date(e.date).toLocaleString("default", { month: "short" });
          grouped[month] = (grouped[month] || 0) + Number(e.amount || 0);
        });

        const formatted = monthOrder
          .filter((m) => grouped[m] !== undefined)
          .map((m) => ({ month: m, totalExpense: grouped[m] }));
        setExpenseData(formatted);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setExpenseData([]);
      }
    };

    const fetchIncome = async () => {
      try {
        const response = await getInvoices();
        const invoices = response.data.invoices || [];

        const grouped = {};
        invoices.forEach((inv) => {
          const month = new Date(inv.date).toLocaleString("default", { month: "short" });
          grouped[month] = (grouped[month] || 0) + Number(inv.total || 0);
        });

        const formatted = monthOrder
          .filter((m) => grouped[m] !== undefined)
          .map((m) => ({ month: m, totalIncome: grouped[m] }));
        setIncomeData(formatted);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setIncomeData([]);
      }
    };

    fetchPayments();
    fetchExpenses();
    fetchIncome();
  }, []);

  useEffect(() => {
    const allMonths = [...new Set([
      ...paymentData.map(d => d.month),
      ...expenseData.map(d => d.month),
      ...incomeData.map(d => d.month)
    ])];

    const combined = monthOrder.filter(m => allMonths.includes(m)).map(month => {
      const payment = paymentData.find(d => d.month === month)?.totalSalary || 0;
      const expense = expenseData.find(d => d.month === month)?.totalExpense || 0;
      const income = incomeData.find(d => d.month === month)?.totalIncome || 0;
      const profit = income - payment - expense;

      return { month, payment, expense, income, profit };
    });

    setCombinedData(combined);
  }, [paymentData, expenseData, incomeData]);

  const summaryData = [
    { name: 'Income', value: incomeData.reduce((a, b) => a + b.totalIncome, 0) },
    { name: 'Expenses', value: expenseData.reduce((a, b) => a + b.totalExpense, 0) },
    { name: 'Salaries', value: paymentData.reduce((a, b) => a + b.totalSalary, 0) }
  ];

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-6 shadow-2xl border flex-1 transform hover:scale-[1.02] transition-all duration-300`}>
          <h1 className={`text-3xl md:text-4xl font-black ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
            Financial Analysis
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            onClick={() => navigate("/billing-dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            className={`px-6 py-3 rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transform hover:scale-[1.02] transition-all duration-300`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Combined Financial Overview
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} fill="url(#incomeGrad)" />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} fill="url(#expenseGrad)" />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#6366f1" strokeWidth={3} dot={{ r: 6 }} fill="url(#profitGrad)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transform hover:scale-[1.02] transition-all duration-300`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Distribution
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transform hover:scale-[1.02] transition-all duration-300`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Comparison
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[10, 10, 0, 0]} />
              <Bar dataKey="payment" name="Salaries" fill="#6366f1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700' : 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300'} rounded-3xl p-8 shadow-2xl border transform hover:scale-105 transition-all duration-300`}>
            <div className="text-5xl mb-4">💰</div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Total Income</h3>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Rs. {summaryData[0]?.value.toLocaleString() || 0}
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gradient-to-br from-red-900/50 to-rose-900/50 border-red-700' : 'bg-gradient-to-br from-red-100 to-rose-100 border-red-300'} rounded-3xl p-8 shadow-2xl border transform hover:scale-105 transition-all duration-300`}>
            <div className="text-5xl mb-4">💸</div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Total Expenses</h3>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Rs. {summaryData[1]?.value.toLocaleString() || 0}
            </p>
          </div>

          <div className={`${darkMode ? 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700' : 'bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-300'} rounded-3xl p-8 shadow-2xl border transform hover:scale-105 transition-all duration-300`}>
            <div className="text-5xl mb-4">📊</div>
            <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>Net Profit</h3>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Rs. {(summaryData[0]?.value - summaryData[1]?.value - summaryData[2]?.value).toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalysisPage;