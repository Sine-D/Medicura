import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sendEmail } from '../utils/emailService';

const LabAppointmentForm = ({ initialData, onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    gender: '',
    testType: '',
    labLocation: '',
    appointmentDate: '',
    preferredTime: '',
    customTime: '',
    notes: '',
    insuranceProvider: '',
    insuranceId: '',
    physician: '',
    terms: false
  });

  // Prefill when initialData provided
  useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => ({
      ...prev,
      fullName: initialData.fullName || `${initialData.firstName || ''} ${initialData.lastName || ''}`.trim(),
      email: initialData.email || prev.email,
      phone: initialData.phone || initialData.phoneNumber || prev.phone,
      gender: (initialData.gender || '').toLowerCase() || prev.gender,
      testType: initialData.testType || prev.testType,
      appointmentDate: initialData.appointmentDate || initialData.preferredDate || prev.appointmentDate,
      preferredTime: initialData.preferredTime || prev.preferredTime,
      customTime: initialData.customTime || prev.customTime,
      insuranceProvider: initialData.insuranceProvider || prev.insuranceProvider,
      physician: initialData.physician || initialData.referringDoctor || prev.physician,
      notes: initialData.specialRequirements || prev.notes
    }));
  }, [initialData]);

  const [currentSection, setCurrentSection] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Input validations
    if (name === 'phone') {
      // Allow only numbers and limit to 10 digits
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: phoneValue
      });
    } else if (name === 'fullName') {
      // Allow only letters and spaces
      if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'testType') {
      // Allow only letters and spaces
      if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    setFormData({
      ...formData,
      preferredTime: time
    });
  };

  // Validate current section
  const validateSection = (section) => {
    const newErrors = {};

    if (section === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (!/^[A-Za-z\s]*$/.test(formData.fullName)) {
        newErrors.fullName = 'Full name should contain only letters';
      }
      if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Please enter a valid age';
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (formData.phone.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number should contain only digits';
      }
      if (!formData.gender) newErrors.gender = 'Please select your gender';
    }

    if (section === 2) {
      if (!formData.testType.trim()) {
        newErrors.testType = 'Test type is required';
      } else if (!/^[A-Za-z\s]*$/.test(formData.testType)) {
        newErrors.testType = 'Test type should contain only letters';
      }
      if (!formData.labLocation.trim()) newErrors.labLocation = 'Lab location is required';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.appointmentDate);
      if (!formData.appointmentDate || selectedDate < today) newErrors.appointmentDate = 'Please select a valid date';
      
      if (!formData.preferredTime) newErrors.preferredTime = 'Please select a time slot';
    }

    if (section === 3) {
      if (!formData.terms) newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next section
  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(currentSection + 1);
    }
  };

  // Navigate to previous section
  const prevSection = () => {
    setCurrentSection(currentSection - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateSection(3)) {
      // Generate a random reference number
      const ref = 'LB' + Math.floor(100000 + Math.random() * 900000);
      setReferenceNumber(ref);
  
      // Include referenceNumber in the payload
      const payload = { ...formData, referenceNumber: ref };
  
      try {
  // Send data to backend
  const response = await axios.post("http://localhost:5000/api/lab-appointments", payload);
        console.log("Backend response:", response.data);

        // Send confirmation email to the patient
        try {
          const emailData = {
            to: formData.email,
            ...payload
          };
          
          const emailResult = await sendEmail(emailData);
          
          if (emailResult.success) {
            console.log("Confirmation email sent successfully:", emailResult.message);
          } else {
            console.error("Failed to send confirmation email:", emailResult.error);
            // Don't fail the entire process if email fails
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Don't fail the entire process if email fails
        }

        // Notify parent first to allow any follow-up (like removing request)
        if (onSuccess) {
          await onSuccess();
        }

        // Show success message
        setSubmitted(true);
      } catch (error) {
        console.error("Error saving appointment:", error);
        // Try to surface backend message when available
        const backendMessage = error?.response?.data?.message || error?.message || "There was an error saving your appointment. Please try again.";
        alert(backendMessage);
      }
    }
  };

  // Render success message
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="text-center py-8">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for booking your lab test appointment. You will receive a confirmation email shortly.</p>
          <p className="text-gray-800 font-semibold">Your appointment reference: <span className="text-blue-600">{referenceNumber}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-8">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Lab Test Appointment</h1>
        <p className="mt-2 opacity-90">Schedule your tests quickly and easily with our online booking system</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between relative px-8 py-6 border-b">
        <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-200 transform -translate-y-1/2 -z-10"></div>
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
              ${currentSection > step ? 'bg-green-500 border-green-500 text-white' : 
                currentSection === step ? 'bg-blue-600 border-blue-600 text-white' : 
                'bg-white border-gray-300 text-gray-500'}`}>
              {step}
            </div>
            <span className="text-xs mt-2 text-gray-600">
              {step === 1 ? 'Personal' : step === 2 ? 'Appointment' : 'Review'}
            </span>
          </div>
        ))}
      </div>

      {/* Form Sections */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Section 1: Personal Information */}
        {currentSection === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your age"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="(123) 456-7890"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {['Male', 'Female', 'Other'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender.toLowerCase()}
                      checked={formData.gender === gender.toLowerCase()}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextSection}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
        
        {/* Section 2: Appointment Details */}
        {currentSection === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.testType ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Blood Test, Urine Analysis"
                />
                {errors.testType && <p className="text-red-500 text-xs mt-1">{errors.testType}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Lab Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="labLocation"
                  value={formData.labLocation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.labLocation ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter lab location"
                />
                {errors.labLocation && <p className="text-red-500 text-xs mt-1">{errors.labLocation}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.appointmentDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.appointmentDate && <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time Slot <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', 'Any Time'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSlotSelect(time.toLowerCase().replace(' ', '-'))}
                      className={`py-2 text-sm rounded border ${formData.preferredTime === time.toLowerCase().replace(' ', '-') ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime}</p>}
                
                {formData.preferredTime === 'any-time' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specify Preferred Time
                    </label>
                    <input
                      type="text"
                      name="customTime"
                      value={formData.customTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your preferred time"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions or Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requirements or notes..."
              ></textarea>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevSection}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={nextSection}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
        
        {/* Section 3: Review & Insurance */}
        {currentSection === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">Review & Additional Information</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                <p><span className="font-medium">Age:</span> {formData.age}</p>
                <p><span className="font-medium">Gender:</span> {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) : ''}</p>
                <p><span className="font-medium">Contact:</span> {formData.email} | {formData.phone}</p>
                <hr className="my-3" />
                <p><span className="font-medium">Test Type:</span> {formData.testType}</p>
                <p><span className="font-medium">Lab Location:</span> {formData.labLocation}</p>
                <p><span className="font-medium">Appointment Date:</span> {formData.appointmentDate}</p>
                <p><span className="font-medium">Preferred Time:</span> {formData.preferredTime === 'any-time' ? formData.customTime || 'Any time' : formData.preferredTime}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Provider (Optional)
              </label>
              <input
                type="text"
                name="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Blue Cross, Aetna"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance ID (Optional)
                </label>
                <input
                  type="text"
                  name="insuranceId"
                  value={formData.insuranceId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Insurance member ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referring Physician (Optional)
                </label>
                <input
                  type="text"
                  name="physician"
                  value={formData.physician}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doctor's name"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  className="mt-1 mr-2"
                />
                <span className="text-sm">
                  I confirm that the information provided is accurate and I agree to the terms of service. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevSection}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* Footer */}
      <div className="bg-gray-100 text-center p-4 text-sm text-gray-600">
        <p>© 2023 MediLab Solutions. All rights reserved. | <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> | <a href="#" className="text-blue-600 hover:underline">Terms of Service</a></p>
      </div>
    </div>
  );
};

export default LabAppointmentForm;