import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BuyPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form state for dynamic payment details
  const [formData, setFormData] = useState({
    firstName: "Ishan",
    lastName: "Ekanayaka",
    email: "test@gmail.com",
    phone: "0712345678",
    address: "Ruwanwella",
    city: "Kegalle",
    amount: "1500.00",
    items: "Medical Center Consultation"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOrderId = () => {
    return `ORDER${Date.now()}`;
  };

  const handlePayHereClick = async () => {
    setLoading(true);
    try {
      const orderId = generateOrderId();
      
      // FIXED: Changed port from 5000 to 4000
      const response = await fetch("http://localhost:4000/api/payhere/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          items: formData.items,
          currency: "LKR",
          amount: formData.amount,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-float"
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
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 transform hover:rotate-12 transition-transform">
            <span className="text-5xl">🏥</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            MediCura Payment
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Secure & Fast Payment Gateway
          </p>

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
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
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service/Items
              </label>
              <input
                type="text"
                name="items"
                value={formData.items}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-semibold">Amount:</span>
              <span className="text-2xl font-black text-indigo-600">Rs. {parseFloat(formData.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-semibold">Service:</span>
              <span className="text-gray-800 font-bold">{formData.items}</span>
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
              'Pay with PayHere'
            )}
          </button>

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            Go to Dashboard
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

export default BuyPage;