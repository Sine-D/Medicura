import React, { useState, useEffect } from "react";
import { createInvoice, updateInvoice } from "../services/invoiceService";

const InvoiceForm = ({ currentInvoice, refresh, darkMode = false }) => {
  const [form, setForm] = useState({
    _id: "",
    id: "",
    patientId: "",
    date: "",
    items: [{ service: "", quantity: 1, price: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: "unpaid",
    cashierId: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentInvoice) {
      setForm({
        _id: currentInvoice._id || "",
        id: currentInvoice.id || "",
        patientId: currentInvoice.patientId || "",
        date: currentInvoice.date ? currentInvoice.date.slice(0, 10) : "",
        items: currentInvoice.items?.length
          ? currentInvoice.items
          : [{ service: "", quantity: 1, price: 0 }],
        subtotal: currentInvoice.subtotal || 0,
        tax: currentInvoice.tax || 0,
        total: currentInvoice.total || 0,
        status: currentInvoice.status || "unpaid",
        cashierId: currentInvoice.cashierId || "",
      });
    }
  }, [currentInvoice]);

  const handleChange = (e, index, field) => {
    if (field === "items") {
      const newItems = [...form.items];
      newItems[index][e.target.name] =
        e.target.name === "service" ? e.target.value : Number(e.target.value);
      setForm({ ...form, items: newItems });
      calculateTotals(newItems);
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    setForm((prev) => ({ ...prev, subtotal, tax, total }));
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { service: "", quantity: 1, price: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
    calculateTotals(newItems);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.id.trim()) newErrors.id = "Invoice ID is required";
    else if (!/^INV[0-9]+$/.test(form.id))
      newErrors.id = "Invoice ID must start with 'INV' followed by numbers";

    if (!form.patientId.trim()) newErrors.patientId = "Patient ID is required";
    else if (!/^PT[0-9]+$/.test(form.patientId))
      newErrors.patientId = "Patient ID must start with 'PT' followed by numbers";

    if (!form.date) newErrors.date = "Date is required";
    else if (new Date(form.date) > new Date()) 
      newErrors.date = "Date cannot be in the future";

    if (!form.cashierId.trim()) newErrors.cashierId = "Cashier ID is required";
    else if (!/^CS[0-9]+$/.test(form.cashierId))
      newErrors.cashierId = "Cashier ID must start with 'CS' followed by numbers";

    form.items.forEach((item, index) => {
      if (!item.service.trim()) newErrors[`service_${index}`] = "Service is required";
      if (item.quantity < 1) newErrors[`quantity_${index}`] = "Quantity ≥ 1";
      if (item.price < 0) newErrors[`price_${index}`] = "Price ≥ 0";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...form };
      if (!form._id) delete payload._id;
      if (form._id) await updateInvoice(form._id, payload);
      else await createInvoice(payload);

      setForm({
        _id: "",
        id: "",
        patientId: "",
        date: "",
        items: [{ service: "", quantity: 1, price: 0 }],
        subtotal: 0,
        tax: 0,
        total: 0,
        status: "unpaid",
        cashierId: "",
      });
      setErrors({});
      refresh();
    } catch (err) {
      console.error("Error saving invoice:", err);
    }
  };

  return (
    <form className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transition-all duration-300 hover:scale-[1.01]`} onSubmit={handleSubmit}>
      <h2 className={`text-3xl font-black mb-6 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
        {form._id ? "Edit Invoice" : "New Invoice"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Invoice ID</label>
          <input 
            name="id" 
            value={form.id} 
            onChange={handleChange}
            placeholder="e.g., INV001"
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
            } border-2 outline-none ${errors.id ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.id && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.id}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient ID</label>
          <input 
            name="patientId" 
            value={form.patientId} 
            onChange={handleChange}
            placeholder="e.g., PT001"
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
            } border-2 outline-none ${errors.patientId ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.patientId && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.patientId}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
          <input 
            type="date" 
            name="date" 
            value={form.date} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
            } border-2 outline-none ${errors.date ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.date && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.date}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cashier ID</label>
          <input 
            name="cashierId" 
            value={form.cashierId} 
            onChange={handleChange}
            placeholder="e.g., CS001"
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
            } border-2 outline-none ${errors.cashierId ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.cashierId && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.cashierId}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
          <select 
            name="status" 
            value={form.status} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
            } border-2 outline-none`}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <h3 className={`text-2xl font-bold mt-8 mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Items</h3>
      {form.items.map((item, index) => (
        <div key={index} className={`mb-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
          darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="md:col-span-3">
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</label>
              <input
                name="service"
                placeholder="Service name"
                value={item.service}
                onChange={(e) => handleChange(e, index, "items")}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  darkMode ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } border-2 outline-none ${errors[`service_${index}`] ? 'border-red-500 animate-pulse' : ''}`}
              />
              {errors[`service_${index}`] && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors[`service_${index}`]}</span>}
            </div>
            
            <div>
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="Qty"
                value={item.quantity}
                min="1"
                onChange={(e) => handleChange(e, index, "items")}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  darkMode ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } border-2 outline-none ${errors[`quantity_${index}`] ? 'border-red-500 animate-pulse' : ''}`}
              />
              {errors[`quantity_${index}`] && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors[`quantity_${index}`]}</span>}
            </div>
            
            <div>
              <label className={`block mb-2 font-bold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (Rs.)</label>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={item.price}
                min="0"
                onChange={(e) => handleChange(e, index, "items")}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  darkMode ? 'bg-gray-600 border-gray-500 text-white focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } border-2 outline-none ${errors[`price_${index}`] ? 'border-red-500 animate-pulse' : ''}`}
              />
              {errors[`price_${index}`] && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors[`price_${index}`]}</span>}
            </div>
            
            <div className="flex items-end">
              <div className={`px-4 py-3 rounded-xl font-bold text-lg ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              } w-full text-center`}>
                Rs. {item.quantity * item.price}
              </div>
            </div>
          </div>
          
          {form.items.length > 1 && (
            <button 
              type="button" 
              className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-red-600/60 transform hover:scale-[1.02] transition-all duration-300" 
              onClick={() => removeItem(index)}
            >
              Remove Item
            </button>
          )}
        </div>
      ))}

      <button 
        type="button" 
        className={`w-full mb-6 py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/50 hover:shadow-blue-600/60' 
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/50 hover:shadow-blue-600/60'
        }`}
        onClick={addItem}
      >
        + Add Item
      </button>

      <div className={`p-6 rounded-2xl mb-6 ${
        darkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
      }`}>
        <div className="space-y-2">
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Subtotal: <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Rs. {form.subtotal}</span>
          </p>
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Tax (10%): <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Rs. {form.tax}</span>
          </p>
          <h3 className={`text-2xl font-black ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
            Total: Rs. {form.total}
          </h3>
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
      >
        {form._id ? "Update Invoice" : "Create Invoice"}
      </button>
    </form>
  );
};

export default InvoiceForm;