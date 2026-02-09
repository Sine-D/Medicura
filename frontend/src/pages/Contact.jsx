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
    try {
      const res = await axios.post(backendUrl + '/api/user/contact', { ...formData, token })
      const data = res.data
      if (res.status === 201 && data.success) {
        toast.success('Thanks! Your message has been sent.')
        setSubmittedInfo({ name: formData.name, email: formData.email, subject: formData.subject })
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(data.message || 'Failed to submit contact form')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message
      toast.error(msg)
    }
  };

  return (
    <div className="min-h-screen py-10">
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
          Quantum <span className="neon-text">Communication</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Bridge the gap between humanity and the future of health. Our neural link is always active.
        </p>
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon-cyan/5 blur-[120px] rounded-full'></div>
      </div>

      {/* Contact Form & Info */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-4">
        {/* Form Container */}
        <div className="relative group">
          <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000'></div>
          <form
            onSubmit={handleSubmit}
            className="relative glass-card p-10 flex flex-col h-full"
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-neon-cyan pl-4 uppercase tracking-widest">
              Initiate Link
            </h2>

            {submittedInfo && (
              <div className="mb-8 glass-card border-neon-cyan bg-neon-cyan/10 p-6 flex flex-col gap-2">
                <p className="font-bold text-neon-cyan text-lg uppercase tracking-wider">Transmission Received</p>
                <p className="text-sm text-gray-300">Identity: <span className='text-white'>{submittedInfo.name}</span></p>
                <p className="text-sm text-gray-400">Our medical council will decrypt your message regarding <span className='text-neon-cyan'>"{submittedInfo.subject || 'Direct Inquiry'}"</span> shortly.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input
                type="text"
                name="name"
                placeholder="FULL IDENTITY"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 focus:border-neon-cyan transition-colors outline-none font-medium"
              />
              <input
                type="email"
                name="email"
                placeholder="QUANTUM EMAIL"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 focus:border-neon-cyan transition-colors outline-none font-medium"
              />
            </div>

            <input
              type="text"
              name="subject"
              placeholder="TRANSMISSION SUBJECT"
              value={formData.subject}
              onChange={handleChange}
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 mb-6 focus:border-neon-cyan transition-colors outline-none font-medium"
            />

            <textarea
              name="message"
              placeholder="DETAILED INQUIRY..."
              value={formData.message}
              onChange={handleChange}
              required
              className="bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-gray-600 mb-8 h-48 resize-none focus:border-neon-cyan transition-colors outline-none font-medium"
            ></textarea>

            <button
              type="submit"
              className="neon-button w-full py-5 text-xl tracking-widest uppercase font-black"
            >
              Broadcast Message
            </button>
          </form>
        </div>

        {/* Contact Info container */}
        <div className="flex flex-col gap-8">
          <div className="glass-card p-10 flex flex-col gap-6 flex-1">
            <h2 className="text-2xl font-bold text-white border-l-4 border-neon-purple pl-4 uppercase tracking-widest">
              Nexus Coordinates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'HQ Address', val: 'Level 99, Cyber Tower, NEO-Colombo', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                { label: 'Neural Line', val: '+94 11 000 2050', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                { label: 'Encrypted Email', val: 'nexus@medicura.future', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label: 'Uptime', val: '24/7 Galactic Cycle', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map((info, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className='flex items-center gap-2'>
                    <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={info.icon} /></svg>
                    <span className="font-bold text-white text-xs uppercase tracking-widest">{info.label}</span>
                  </div>
                  <p className="text-gray-400 font-medium pl-7">{info.val}</p>
                </div>
              ))}
            </div>

            {/* Map wrapper */}
            <div className="mt-4 rounded-2xl overflow-hidden glass-card border-none grayscale hover:grayscale-0 transition-all duration-700 h-[280px]">
              <iframe
                title="Medicura Nexus"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.123456789!2d79.861244!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259d1!2sColombo!5e0!3m2!1sen!2slk!4v1695000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
