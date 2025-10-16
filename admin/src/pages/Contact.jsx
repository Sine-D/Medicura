import React, { useState, useContext } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.info('Please log in to send a message');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try{
      const res = await axios.post(backendUrl + '/api/user/contact', { ...formData, token })
      const data = res.data
      if(res.status === 201 && data.success){
        toast.success('Thanks! Your message has been sent.')
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        // Navigate to success page after successful submission
        setTimeout(() => {
          navigate('/contact-success');
        }, 500);
      }else{
        toast.error(data.message || 'Failed to submit contact form')
        setIsSubmitting(false);
      }
    }catch(err){
      const msg = err?.response?.data?.message || err.message
      toast.error(msg)
      setIsSubmitting(false);
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
          We're here to help. Reach out to us for appointments, inquiries, or any questions.
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

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 h-32 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-2xl font-semibold transform hover:-translate-y-1 hover:shadow-xl transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : 'Send Message'}
          </button>
        </form>

        {/* Contact Info */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-500">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">
            Our Contact Info
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start">
              <svg className="w-6 h-6 text-blue-700 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>
                <span className="font-semibold text-blue-700 block">Address:</span>
                123 Medicura Street, Colombo, Sri Lanka
              </span>
            </p>
            <p className="flex items-start">
              <svg className="w-6 h-6 text-blue-700 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>
                <span className="font-semibold text-blue-700 block">Phone:</span>
                +94 11 234 5678
              </span>
            </p>
            <p className="flex items-start">
              <svg className="w-6 h-6 text-blue-700 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>
                <span className="font-semibold text-blue-700 block">Email:</span>
                contact@medicura.lk
              </span>
            </p>
            <p className="flex items-start">
              <svg className="w-6 h-6 text-blue-700 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>
                <span className="font-semibold text-blue-700 block">Working Hours:</span>
                Mon - Sat: 8:00 AM - 6:00 PM
              </span>
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

export default Contact;