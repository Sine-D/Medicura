import React, { useState, useEffect } from "react";
import { createExpense, updateExpense } from "../services/expenseService";

const ExpenseForm = ({ currentExpense, refresh, clearEdit, darkMode = false }) => {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "General",
    date: "",
    description: "",
    addedBy: "",
    paymentMethod: "cash",
    receiptNumber: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentExpense) {
      setForm({
        ...currentExpense,
        date: currentExpense.date ? currentExpense.date.slice(0, 10) : "",
        amount: currentExpense.amount || "",
      });
    }
  }, [currentExpense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const amt = parseFloat(form.amount);

    if (!form.title.trim() || form.title.length < 3)
      newErrors.title = "Title is required (min 3 chars)";
    if (!amt || amt <= 0) newErrors.amount = "Amount must be > 0";
    else if (amt > 1000000) newErrors.amount = "Amount cannot exceed 1,000,000";
    if (!form.category.trim()) newErrors.category = "Category is required";
    if (!form.date) newErrors.date = "Date is required";
    else if (new Date(form.date) > new Date())
      newErrors.date = "Date cannot be in the future";
    if (form.description && form.description.length > 200)
      newErrors.description = "Description cannot exceed 200 chars";
    if (!form.addedBy.trim()) newErrors.addedBy = "Added By is required";
    if (!["cash", "card", "online", "other"].includes(form.paymentMethod))
      newErrors.paymentMethod = "Invalid payment method";
    if (form.receiptNumber && !/^[a-zA-Z0-9-]+$/.test(form.receiptNumber))
      newErrors.receiptNumber = "Receipt number must be alphanumeric";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (currentExpense?._id) {
        await updateExpense(currentExpense._id, data);
        clearEdit();
      } else {
        await createExpense(data);
      }

      setForm({
        title: "",
        amount: "",
        category: "General",
        date: "",
        description: "",
        addedBy: "",
        paymentMethod: "cash",
        receiptNumber: "",
      });
      setErrors({});
      refresh();
    } catch (err) {
      console.error("Error saving expense:", err);
    }
  };

  return (
    <form className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transition-all duration-300 hover:scale-[1.01]`} onSubmit={handleSubmit}>
      <h2 className={`text-3xl font-black mb-6 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600'}`}>
        {currentExpense ? "Edit Expense" : "Add New Expense"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange}
            placeholder="Enter expense title"
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.title ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.title && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.title}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
          <input 
            type="number"
            name="amount" 
            value={form.amount} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.amount ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.amount && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.amount}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
          <input 
            name="category" 
            value={form.category} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none`}
          />
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
          <input 
            type="date"
            name="date" 
            value={form.date} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.date ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.date && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.date}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Added By</label>
          <input 
            name="addedBy" 
            value={form.addedBy} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.addedBy ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.addedBy && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.addedBy}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method</label>
          <select 
            name="paymentMethod" 
            value={form.paymentMethod} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none`}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Receipt Number</label>
          <input 
            name="receiptNumber" 
            value={form.receiptNumber} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.receiptNumber ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.receiptNumber && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.receiptNumber}</span>}
        </div>

        <div className="md:col-span-2">
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description..."
            rows="3"
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-red-500'
            } border-2 outline-none ${errors.description ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.description && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.description}</span>}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          type="submit" 
          className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-red-500/50 hover:shadow-red-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
        >
          {currentExpense ? "Update Expense" : "Add Expense"}
        </button>
        {currentExpense && (
          <button 
            type="button" 
            onClick={clearEdit}
            className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-gray-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;