import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {showConfetti && [...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: Math.random() * 100 + '%',
              top: -20 + 'px',
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 4)],
              animationDelay: Math.random() * 3 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/50 transform hover:scale-105 transition-all duration-500">
          {/* Success Icon */}
          <div className="relative mx-auto mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 animate-bounce-slow">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse opacity-30" />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 animate-fade-in">
            Payment Successful!
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-gray-700 mb-8 font-medium">
            Your transaction has been completed successfully
          </p>

          {/* Transaction Details */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="text-2xl font-black text-green-600">Rs. 1,500</p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-lg font-bold text-gray-800">TX123456789</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white/70 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Payment Date</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/billing")}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/50 hover:shadow-green-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.print()}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              Print Receipt
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              A confirmation email has been sent to your inbox
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;