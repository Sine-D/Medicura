import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LabAppointmentForm from '../components/LabAppointmentForm';

const Laboratory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleAIAssistant = () => {
    navigate('/ai-lab-assistant');
  };

  return (
    <div>
      {/* Blue section with title and buttons */}
      <div className="bg-blue-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 py-12">
            <h1 className="text-4xl md:text-5xl font-bold">
              Advanced Laboratory Testing &amp; Diagnostic Services
            </h1>
            <p className="text-xl md:text-2xl mt-4 max-w-3xl mx-auto">
              Precision diagnostics for better healthcare decisions. Fast, accurate, and reliable laboratory results you can trust.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg transform transition-transform duration-200 hover:-translate-y-1"
              >
                Book Lab Appointment
              </button>
              <button 
                onClick={handleAIAssistant}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg transform transition-transform duration-200 hover:-translate-y-1"
              >
                Check Lab Reports with AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics section */}
      <div className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center bg-white rounded-lg p-6 shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-4xl font-bold text-blue-600">24-48h</div>
            <div className="text-sm mt-2 text-gray-600">Result Time</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-4xl font-bold text-blue-600">200+</div>
            <div className="text-sm mt-2 text-gray-600">Tests Available</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-4xl font-bold text-blue-600">98%</div>
            <div className="text-sm mt-2 text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center bg-white rounded-lg p-6 shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="text-4xl font-bold text-blue-600">5000+</div>
            <div className="text-sm mt-2 text-gray-600">Samples Processed Monthly</div>
          </div>
        </div>
      </div>

      {/* Our Laboratory Services section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">Our Laboratory Services</h2>
          <p className="text-gray-600 text-xl">Comprehensive diagnostic testing for all your healthcare needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Blood Tests Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l-1.5 1.5L2 12l10 10 10-10-8.5-8.5L12 2zm0 2.8l7.5 7.5H4.5L12 4.8z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Blood Tests</h3>
            <p className="text-gray-600 text-center">
              Complete blood count, cholesterol, glucose, and specialized blood analysis with rapid results.
            </p>
          </div>

          {/* Genetic Testing Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L3 9l9 7 9-7-9-7zm0 16l-9-7 9 7 9-7-9 7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Genetic Testing</h3>
            <p className="text-gray-600 text-center">
              DNA analysis, carrier screening, and pharmacogenetic testing for personalized medicine.
            </p>
          </div>

          {/* Pathology Card */}
          <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform duration-200 hover:-translate-y-2 hover:shadow-xl">
            <div className="flex justify-center mb-6">
              <svg className="w-16 h-16 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Pathology</h3>
            <p className="text-gray-600 text-center">
              Tissue analysis, cytology, and histopathology services by expert pathologists.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="bg-[#1e1b4b] text-white mt-20 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* MediCura Laboratory Info */}
            <div>
              <h3 className="text-blue-400 text-xl font-semibold mb-4">MediCura Laboratory</h3>
              <p className="text-gray-300">
                Providing accurate and reliable diagnostic services for over 15 years. Your health is our priority.
              </p>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="text-blue-400 text-xl font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-gray-300">123 Medical Drive, Health City,Srilanka</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="text-gray-300">045-1234567 -LABS</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-gray-300">laboratory@medicura.com</span>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-blue-400 text-xl font-semibold mb-4">Working Hours</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-gray-300">Monday-Friday: 7am-9pm</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-gray-300">Saturday: 7am-5pm</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-gray-300">Sunday: 8am-2pm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            © MediCura Medical Center. All rights reserved.
          </div>
        </div>
      </div>

      {/* Lab Appointment Form Popup */}
      <LabAppointmentForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default Laboratory;
