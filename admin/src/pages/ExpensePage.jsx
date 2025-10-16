import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getExpenses, deleteExpense } from "../services/expenseService";
import ExpenseForm from "../components/ExpenseForm";
import jsPDF from "jspdf";

const ExpensePage = ({ darkMode = false, onUpdate }) => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await getExpenses();
      const expensesData = Array.isArray(response.data) ? response.data : [];
      setExpenses(expensesData);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    }
  }, [onUpdate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        await fetchExpenses();
      } catch (err) {
        console.error("Error deleting expense:", err);
      }
    }
  };

  const handlePayExpense = (expense) => {
    navigate("/pay-expense", { 
      state: { 
        expense: {
          id: expense._id,
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          addedBy: expense.addedBy,
          receiptNumber: expense.receiptNumber
        }
      } 
    });
  };

  const clearEdit = () => setCurrentExpense(null);

  const filteredExpenses = expenses
    .filter(
      (exp) =>
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.addedBy?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((exp) => (viewMode === "all" ? true : exp.category === viewMode));

  const generatePDF = (exp) => {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text("MediCura Medical Center", 105, 20, { align: "center" });
    
    doc.setFontSize(18);
    doc.setTextColor(239, 68, 68);
    doc.text("Expense Report", 105, 35, { align: "center" });
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(20, 42, 190, 42);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const startY = 55;
    const lineHeight = 12;
    
    doc.text(`Title: ${exp.title}`, 25, startY);
    doc.text(`Amount: Rs. ${exp.amount.toLocaleString()}`, 25, startY + lineHeight);
    doc.text(`Category: ${exp.category}`, 25, startY + lineHeight * 2);
    doc.text(`Date: ${new Date(exp.date).toLocaleDateString()}`, 25, startY + lineHeight * 3);
    doc.text(`Added By: ${exp.addedBy || "N/A"}`, 25, startY + lineHeight * 4);
    doc.text(`Payment Method: ${exp.paymentMethod}`, 25, startY + lineHeight * 5);
    doc.text(`Receipt Number: ${exp.receiptNumber || "-"}`, 25, startY + lineHeight * 6);
    
    if (exp.description) {
      doc.text("Description:", 25, startY + lineHeight * 7);
      const splitDesc = doc.splitTextToSize(exp.description, 160);
      doc.text(splitDesc, 25, startY + lineHeight * 8);
    }
    
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(20, 270, 190, 270);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for using MediCura Expense Management System", 105, 280, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 287, { align: "center" });
    
    doc.save(`expense_${exp._id}_${Date.now()}.pdf`);
  };

  const handlePrint = (exp) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Print - ${exp.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h2 { color: #4f46e5; text-align: center; margin-bottom: 10px; }
            h3 { color: #ef4444; text-align: center; margin-bottom: 30px; }
            .detail { margin: 15px 0; font-size: 14px; }
            .label { font-weight: bold; color: #374151; }
            hr { border: 1px solid #4f46e5; margin: 30px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <h2>MediCura Medical Center</h2>
          <h3>Expense Report</h3>
          <div class="detail"><span class="label">Title:</span> ${exp.title}</div>
          <div class="detail"><span class="label">Amount:</span> Rs. ${exp.amount.toLocaleString()}</div>
          <div class="detail"><span class="label">Category:</span> ${exp.category}</div>
          <div class="detail"><span class="label">Date:</span> ${new Date(exp.date).toLocaleDateString()}</div>
          <div class="detail"><span class="label">Added By:</span> ${exp.addedBy || "N/A"}</div>
          <div class="detail"><span class="label">Payment Method:</span> ${exp.paymentMethod}</div>
          <div class="detail"><span class="label">Receipt Number:</span> ${exp.receiptNumber || "-"}</div>
          ${exp.description ? `<div class="detail"><span class="label">Description:</span> ${exp.description}</div>` : ''}
          <hr/>
          <div class="footer">Printed from MediCura Expense Management System</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className={`min-h-screen p-6 transition-all duration-500 ${localDarkMode ? 'bg-gradient-to-br from-gray-900 via-red-900 to-gray-900' : 'bg-gradient-to-br from-red-50 via-orange-50 to-pink-50'}`}>
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
        <h1 className={`text-4xl md:text-5xl font-black mb-2 ${localDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600'}`}>
          💸 Expense Management
        </h1>
        <p className={`${localDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg font-medium`}>
          Track and manage all business expenses efficiently
        </p>
      </div>

      <div className="mb-8">
        <ExpenseForm currentExpense={currentExpense} refresh={fetchExpenses} clearEdit={clearEdit} darkMode={localDarkMode} />
      </div>

      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {["all", "General", "Medical"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-110 ${
              viewMode === mode
                ? `${localDarkMode ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'} shadow-2xl shadow-red-500/50`
                : `${localDarkMode ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' : 'bg-white/50 text-gray-700 hover:bg-white/80'} shadow-lg`
            }`}
          >
            {mode === "all" ? "All Categories" : mode}
          </button>
        ))}
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="🔍 Search by title or added by..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full px-6 py-4 rounded-2xl font-medium shadow-lg transition-all duration-300 focus:shadow-2xl focus:scale-[1.02] ${
              localDarkMode 
                ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-400 focus:border-red-500' 
                : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500'
            } border-2 outline-none backdrop-blur-xl`}
          />
        </div>
      </div>

      <div className={`${localDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl shadow-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${localDarkMode ? 'bg-gradient-to-r from-red-900 to-orange-900' : 'bg-gradient-to-r from-red-600 to-orange-600'} text-white`}>
              <tr>
                {['Title', 'Amount', 'Category', 'Date', 'Added By', 'Payment Method', 'Receipt', 'Actions'].map((header) => (
                  <th key={header} className="py-4 px-6 text-left font-bold text-sm uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp, idx) => (
                  <tr
                    key={exp._id}
                    className={`${idx % 2 === 0 ? (localDarkMode ? 'bg-gray-700/30' : 'bg-red-50/50') : (localDarkMode ? 'bg-gray-700/10' : 'bg-white/50')} hover:${localDarkMode ? 'bg-red-900/30' : 'bg-red-100/70'} transition-all duration-200 transform hover:scale-[1.01]`}
                  >
                    <td className={`py-4 px-6 font-semibold ${localDarkMode ? 'text-white' : 'text-gray-900'}`}>{exp.title}</td>
                    <td className={`py-4 px-6 font-black text-lg ${localDarkMode ? 'text-red-400' : 'text-red-600'}`}>Rs. {exp.amount.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        exp.category === 'Medical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className={`py-4 px-6 ${localDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td className={`py-4 px-6 font-medium ${localDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exp.addedBy || "N/A"}</td>
                    <td className={`py-4 px-6 ${localDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{exp.paymentMethod}</td>
                    <td className={`py-4 px-6 font-mono text-sm ${localDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{exp.receiptNumber || "-"}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handlePayExpense(exp)} 
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all"
                        >
                          💳 Pay Now
                        </button>
                        <button onClick={() => setCurrentExpense(exp)} className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(exp._id)} className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all">
                          🗑️ Delete
                        </button>
                        <button onClick={() => generatePDF(exp)} className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all">
                          📄 PDF
                        </button>
                        <button onClick={() => handlePrint(exp)} className="px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-110 transition-all">
                          🖨️ Print
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
                      <span>No expenses found</span>
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

export default ExpensePage;