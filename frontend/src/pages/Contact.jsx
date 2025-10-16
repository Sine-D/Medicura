import React, { useState, useContext } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { backendUrl, token } = useContext(AppContext)
  const [submittedInfo, setSubmittedInfo] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info('Please log in to send a message');
      navigate('/login');
      return;
    }
    try{
      const res = await axios.post(backendUrl + '/api/user/contact', { ...formData, token })
      const data = res.data
      if(res.status === 201 && data.success){
        toast.success('Thanks! Your message has been sent.')
        setSubmittedInfo({ name: formData.name, email: formData.email, subject: formData.subject })
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }else{
        toast.error(data.message || 'Failed to submit contact form')
      }
    }catch(err){
      const msg = err?.response?.data?.message || err.message
      toast.error(msg)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-700 mb-4 drop-shadow-md">
          Contact Medicura
        </h1>
        <p className="text-gray-600 text-lg">
          We’re here to help. Reach out to us for appointments, inquiries, or any questions.
        </p>
      </div>

      {/* Contact Form & Info */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-500"
        >
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Send Us a Message
          </h2>

          {submittedInfo && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
              <p className="font-semibold">Message received</p>
              <p className="text-sm mt-1">Thank you {submittedInfo.name}! We’ve received your message{submittedInfo.subject ? ` about "${submittedInfo.subject}"` : ''}.</p>
              <p className="text-xs mt-1">A confirmation has been noted for {submittedInfo.email}. Our team will reply within 1–2 business days.</p>
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 h-32 resize-none"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-2xl font-semibold transform hover:-translate-y-1 hover:shadow-xl transition duration-300"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-500">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Our Contact Info
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-semibold text-blue-700">Address:</span>{" "}
              123 Medicura Street, Colombo, Sri Lanka
            </p>
            <p>
              <span className="font-semibold text-blue-700">Phone:</span>{" "}
              +94 11 234 5678
            </p>
            <p>
              <span className="font-semibold text-blue-700">Email:</span>{" "}
              contact@medicura.lk
            </p>
            <p>
              <span className="font-semibold text-blue-700">Working Hours:</span>{" "}
              Mon - Sat: 8:00 AM - 6:00 PM
            </p>
          </div>

          {/* Map */}
          <div className="mt-6 rounded-xl overflow-hidden shadow-md">
            <iframe
              title="Medicura Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.123456789!2d79.861244!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259d1!2sColombo!5e0!3m2!1sen!2slk!4v1695000000000"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
