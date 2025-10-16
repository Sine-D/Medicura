import React from "react";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-400/10 to-orange-400/10 animate-float-slow"
            style={{
              width: Math.random() * 150 + 80 + 'px',
              height: Math.random() * 150 + 80 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 8 + 12 + 's'
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full mx-4">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/50 transform hover:scale-105 transition-all duration-500">
          {/* Cancel Icon */}
          <div className="relative mx-auto mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 animate-shake">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            {/* Warning rings */}
            <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-20" />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
            Payment Cancelled
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-center text-gray-700 mb-8 font-medium">
            Your payment was cancelled. No charges were made.
          </p>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">What happened?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Your payment process was interrupted or cancelled</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No money has been deducted from your account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>You can try again or contact support if you need help</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reasons Box */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border border-yellow-200">
            <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              Common Reasons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Cancelled by user</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Payment timeout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Insufficient funds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Network issues</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              Try Payment Again
            </button>
            <button
              onClick={() => navigate("/billing")}
              className="w-full py-4 px-6 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-gray-500/50 hover:shadow-gray-600/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Support Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Need help?</p>
            <button 
              onClick={() => navigate("/contact")}
              className="text-indigo-600 font-semibold hover:text-indigo-700 underline transition-colors duration-200"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(20px); opacity: 0.4; }
        }
        .animate-float-slow {
          animation: float-slow ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CancelPage;