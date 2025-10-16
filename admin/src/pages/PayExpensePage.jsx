import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PayExpensePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Get expense data from navigation state
  const expenseData = location.state?.expense;

  // Form state - pre-filled with expense data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    amount: expenseData?.amount?.toString() || "0.00",
    items: expenseData?.title || "Expense Payment"
  });

  useEffect(() => {
    // Redirect if no expense data
    if (!expenseData) {
      navigate("/billing");
    }
  }, [expenseData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOrderId = () => {
    return `EXP${expenseData?.id?.slice(-6) || Date.now()}`;
  };

  const handlePayHereClick = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const orderId = generateOrderId();
      
      const response = await fetch("http://localhost:4000/api/payhere/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          items: `${formData.items} - ${expenseData?.category || 'General'}`,
          currency: "LKR",
          amount: formData.amount,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address || "N/A",
          city: formData.city || "Colombo",
          country: "Sri Lanka",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const fields = await response.json();

      // Create and submit form to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      for (const key in fields) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!expenseData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-400/20 to-orange-400/20 animate-float"
            style={{
              width: Math.random() * 200 + 100 + 'px',
              height: Math.random() * 200 + 100 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 15 + 's'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl border border-white/50 transform hover:scale-[1.01] transition-all duration-500">
          {/* Logo/Icon */}
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/50 transform hover:rotate-12 transition-transform">
            <span className="text-5xl">💸</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            Pay Expense
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Complete payment for your expense
          </p>

          {/* Expense Details Summary */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-6 border border-red-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Expense Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Title:</span>
                <span className="text-gray-800 font-bold">{expenseData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-semibold">Category:</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  {expenseData.category}
                </span>
              </div>
              {expenseData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Description:</span>
                  <span className="text-gray-800 text-sm">{expenseData.description}</span>
                </div>
              )}
              {expenseData.receiptNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Receipt:</span>
                  <span className="text-gray-800 font-mono text-sm">{expenseData.receiptNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-red-200">
                <span className="text-gray-600 font-semibold text-lg">Amount:</span>
                <span className="text-3xl font-black text-red-600">Rs. {parseFloat(expenseData.amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payer Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* PayHere Button */}
          <button
            onClick={handlePayHereClick}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              '💳 Pay with PayHere'
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={() => navigate("/billing")}
            className="w-full py-4 px-6 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-gray-500/50 hover:shadow-gray-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            ← Back to Dashboard
          </button>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            Secured by PayHere
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(20px) rotate(90deg); opacity: 0.5; }
          50% { transform: translateY(-60px) translateX(-20px) rotate(180deg); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(-40px) rotate(270deg); opacity: 0.5; }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PayExpensePage;