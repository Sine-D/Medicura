import React, { useState } from 'react';

const LabAppointmentForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    preferredDate: '',
    preferredTime: '',
    testType: '',
    urgencyLevel: 'Routine',
    referringDoctor: '',
    insuranceProvider: '',
    specialRequirements: '',
    contactPreference: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 w-96 md:w-[800px] shadow-[0_0_40px_rgba(0,0,0,0.15)] rounded-xl bg-white/95 backdrop-blur-sm transform transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-600 mb-2">Patient Information Form</h2>
            <div className="h-1 w-20 bg-blue-600 rounded"></div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-8 text-lg">Please provide your details to request a lab appointment</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2">Other</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
              </svg>
              Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Preferred Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Preferred Time <span className="text-red-500">*</span></label>
                <select
                  required
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                >
                  <option value="">Select a time slot</option>
                  <option value="morning">Morning (7AM - 11AM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (5PM - 7PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Type of Test Needed</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.testType}
                  onChange={(e) => setFormData({...formData, testType: e.target.value})}
                >
                  <option value="">Select a test type</option>
                  <option value="blood">Blood Test</option>
                  <option value="genetic">Genetic Testing</option>
                  <option value="pathology">Pathology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Urgency Level</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({...formData, urgencyLevel: e.target.value})}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Additional Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Referring Doctor (if any)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.referringDoctor}
                  onChange={(e) => setFormData({...formData, referringDoctor: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Insurance Provider</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Special Requirements or Notes</label>
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="3"
                placeholder="Any special requirements or notes for our lab assistant..."
                value={formData.specialRequirements}
                onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">How would you like to be contacted? <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                <label className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    value="phone"
                    checked={formData.contactPreference.includes('phone')}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...formData.contactPreference, 'phone']
                        : formData.contactPreference.filter(item => item !== 'phone');
                      setFormData({...formData, contactPreference: updated});
                    }}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="ml-2">Phone Call</span>
                </label>
                <label className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    value="email"
                    checked={formData.contactPreference.includes('email')}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...formData.contactPreference, 'email']
                        : formData.contactPreference.filter(item => item !== 'email');
                      setFormData({...formData, contactPreference: updated});
                    }}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="ml-2">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value="sms"
                    checked={formData.contactPreference.includes('sms')}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...formData.contactPreference, 'sms']
                        : formData.contactPreference.filter(item => item !== 'sms');
                      setFormData({...formData, contactPreference: updated});
                    }}
                    className="form-checkbox text-blue-600"
                  />
                  <span className="ml-2">SMS/Text Message</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            Send to Lab Assistant
          </button>
          
          <p className="text-sm text-gray-500 text-center mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            Your information will be sent to our lab assistant who will contact you to confirm your appointment.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LabAppointmentForm;
