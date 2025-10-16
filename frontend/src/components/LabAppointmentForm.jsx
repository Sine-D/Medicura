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
    customTime: '',
    testType: '',
    urgencyLevel: 'Normal',
    referringDoctor: '',
    insuranceProvider: '',
    specialRequirements: '',
    contactPreference: []
  });

  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      if (checked) {
        return { ...prevData, contactPreference: [...prevData.contactPreference, value] };
      } else {
        return {
          ...prevData,
          contactPreference: prevData.contactPreference.filter((item) => item !== value)
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Info
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name should contain only letters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name should contain only letters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (formData.dateOfBirth > today) {
      newErrors.dateOfBirth = "Date of birth cannot be in the future";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";

    // Appointment Info
    if (!formData.preferredDate) {
      newErrors.preferredDate = "Preferred date is required";
    } else if (formData.preferredDate < today) {
      newErrors.preferredDate = "Preferred date cannot be in the past";
    }

    if (!formData.preferredTime) newErrors.preferredTime = "Preferred time is required";
    if (!formData.testType.trim()) newErrors.testType = "Test type is required";

    // Contact Preference
    if (formData.contactPreference.length === 0)
      newErrors.contactPreference = "Select at least one contact preference";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/patient-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("✅ Appointment request submitted successfully!");
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: '',
          preferredDate: '',
          preferredTime: '',
          customTime: '',
          testType: '',
          urgencyLevel: 'Normal',
          referringDoctor: '',
          insuranceProvider: '',
          specialRequirements: '',
          contactPreference: []
        });
        setErrors({});
      } else {
        alert("❌ Failed to submit appointment request");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("⚠️ Something went wrong. Please try again later.");
    }
  };

  if (!isOpen) return null;

  const inputClass = (field) =>
    `w-full p-2 border rounded focus:outline-none focus:ring-2 ${
      errors[field] ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
    }`;

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

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

        <p className="text-gray-600 mb-8 text-lg">
          Please provide your details to request a lab appointment
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>First Name *</label>
                <input
                  type="text"
                  className={inputClass("firstName")}
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value.replace(/[^A-Za-z]/g, '') })
                  }
                />
                {renderError("firstName")}
              </div>

              <div>
                <label>Last Name *</label>
                <input
                  type="text"
                  className={inputClass("lastName")}
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value.replace(/[^A-Za-z]/g, '') })
                  }
                />
                {renderError("lastName")}
              </div>

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  className={inputClass("email")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {renderError("email")}
              </div>

              <div>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  className={inputClass("phoneNumber")}
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })
                  }
                  maxLength="10"
                />
                {renderError("phoneNumber")}
              </div>

              <div>
                <label>Date of Birth *</label>
                <input
                  type="date"
                  className={inputClass("dateOfBirth")}
                  value={formData.dateOfBirth}
                  max={today}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                {renderError("dateOfBirth")}
              </div>

              <div>
                <label>Gender *</label>
                <select
                  className={inputClass("gender")}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {renderError("gender")}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Preferred Date *</label>
                <input
                  type="date"
                  className={inputClass("preferredDate")}
                  value={formData.preferredDate}
                  min={today}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
                {renderError("preferredDate")}
              </div>

              <div>
                <label>Preferred Time *</label>
                <select
                  className={inputClass("preferredTime")}
                  value={formData.preferredTime}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredTime: e.target.value, customTime: '' })
                  }
                >
                  <option value="">Select a time slot</option>
                  <option value="morning">Morning (7AM - 11AM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (5PM - 7PM)</option>
                  <option value="anytime">Any Time</option>
                </select>
                {renderError("preferredTime")}

                {formData.preferredTime === 'anytime' && (
                  <input
                    type="text"
                    placeholder="Enter preferred time"
                    className="w-full mt-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formData.customTime}
                    onChange={(e) => setFormData({ ...formData, customTime: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label>Type of Test Needed *</label>
                <input
                  type="text"
                  className={inputClass("testType")}
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                />
                {renderError("testType")}
              </div>

              <div>
                <label>Urgency Level</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Referring Doctor</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.referringDoctor}
                  onChange={(e) => setFormData({ ...formData, referringDoctor: e.target.value })}
                />
              </div>

              <div>
                <label>Insurance Provider</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label>Special Requirements</label>
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows="3"
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label>Contact Preference *</label>
                <div className="flex gap-4">
                  {['Email', 'Phone', 'SMS'].map((method) => (
                    <label key={method}>
                      <input
                        type="checkbox"
                        value={method}
                        checked={formData.contactPreference.includes(method)}
                        onChange={handleCheckboxChange}
                      /> {method}
                    </label>
                  ))}
                </div>
                {renderError("contactPreference")}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabAppointmentForm;
