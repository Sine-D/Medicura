import React, { useState, useEffect } from "react";
import { createEmployeePayment, updateEmployeePayment } from "../services/employeePaymentService";

const EmployeePaymentForm = ({ currentPayment, addOrUpdatePayment, clearEdit, darkMode = false }) => {
  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    role: "Doctor",
    baseSalary: 0,
    attendanceDays: 0,
    totalSalary: 0,
    paymentDate: "",
    status: "pending",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentPayment) {
      setForm({
        ...currentPayment,
        paymentDate: currentPayment.paymentDate ? currentPayment.paymentDate.slice(0, 10) : "",
      });
    }
  }, [currentPayment]);

  useEffect(() => {
    let calculated = form.baseSalary;
    if (form.attendanceDays >= 20) calculated += 7500;
    setForm((prev) => ({ ...prev, totalSalary: calculated }));
  }, [form.baseSalary, form.attendanceDays]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "baseSalary" || name === "attendanceDays" ? parseFloat(value) || 0 : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
    else if (!/^EMP[0-9]+$/.test(form.employeeId))
      newErrors.employeeId = "Employee ID must start with 'EMP' followed by numbers";
    if (!form.employeeName.trim()) newErrors.employeeName = "Employee Name is required";
    else if (form.employeeName.length < 3) newErrors.employeeName = "Name must be at least 3 characters";
    if (form.baseSalary <= 0) newErrors.baseSalary = "Base Salary must be greater than 0";
    if (form.attendanceDays < 0 || form.attendanceDays > 31)
      newErrors.attendanceDays = "Attendance Days must be between 0 and 31";
    if (!form.paymentDate) newErrors.paymentDate = "Payment Date is required";
    else if (new Date(form.paymentDate) > new Date()) newErrors.paymentDate = "Payment Date cannot be in the future";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      let savedPayment;
      if (currentPayment?._id) {
        savedPayment = await updateEmployeePayment(currentPayment._id, form);
        clearEdit();
      } else {
        savedPayment = await createEmployeePayment(form);
      }
      addOrUpdatePayment(savedPayment.data);
      setForm({
        employeeId: "",
        employeeName: "",
        role: "Doctor",
        baseSalary: 0,
        attendanceDays: 0,
        totalSalary: 0,
        paymentDate: "",
        status: "pending",
      });
      setErrors({});
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  };

  return (
    <form className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white/80 backdrop-blur-xl border-white/50'} rounded-3xl p-8 shadow-2xl border transition-all duration-300 hover:scale-[1.01]`} onSubmit={handleSubmit}>
      <h2 className={`text-3xl font-black mb-6 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
        {currentPayment ? "Edit Employee Payment" : "Add Employee Payment"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Employee ID</label>
          <input 
            name="employeeId" 
            value={form.employeeId} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none ${errors.employeeId ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.employeeId && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.employeeId}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Employee Name</label>
          <input 
            name="employeeName" 
            value={form.employeeName} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none ${errors.employeeName ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.employeeName && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.employeeName}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none`}
          >
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="Attendant">Attendant</option>
            <option value="Receptionist">Receptionist</option>
          </select>
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Base Salary</label>
          <input 
            type="number" 
            name="baseSalary" 
            value={form.baseSalary} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none ${errors.baseSalary ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.baseSalary && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.baseSalary}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Attendance Days</label>
          <input 
            type="number" 
            name="attendanceDays" 
            value={form.attendanceDays} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none ${errors.attendanceDays ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.attendanceDays && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.attendanceDays}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Salary (Auto-calculated)</label>
          <input 
            type="number" 
            value={form.totalSalary} 
            readOnly
            className={`w-full px-4 py-3 rounded-xl font-bold text-lg ${
              darkMode ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-green-50 border-green-300 text-green-700'
            } border-2`}
          />
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Date</label>
          <input 
            type="date" 
            name="paymentDate" 
            value={form.paymentDate} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none ${errors.paymentDate ? 'border-red-500 animate-pulse' : ''}`}
          />
          {errors.paymentDate && <span className="text-red-500 text-sm mt-1 block font-semibold">{errors.paymentDate}</span>}
        </div>

        <div>
          <label className={`block mb-2 font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
          <select 
            name="status" 
            value={form.status} 
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-indigo-500'
            } border-2 outline-none`}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button 
          type="submit" 
          className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-500/50 hover:shadow-indigo-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
        >
          {currentPayment ? "Update Payment" : "Add Payment"}
        </button>
        {currentPayment && (
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

export default EmployeePaymentForm;