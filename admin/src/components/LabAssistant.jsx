import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import LabForm from './LabForm';
import { sendEmail } from '../utils/emailService';

const LabAssistant = () => {
    const location = useLocation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const notificationRef = useRef(null);

    // Handle click outside to close notification dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Function to open the form
    const openForm = () => {
        setIsFormOpen(true);
    };

    // Function to close the form
    const closeForm = () => {
        setIsFormOpen(false);
    };

    // Patient-form requests from Medicura2-main backend
    const [patientForms, setPatientForms] = useState([]);
    const [patientFormsLoading, setPatientFormsLoading] = useState(true);
    const [patientFormsError, setPatientFormsError] = useState("");
    const seenPatientFormIds = useRef(new Set());

    useEffect(() => {
        const fetchPatientForms = async () => {
            try {
                setPatientFormsLoading(true);
                setPatientFormsError("");
                const res = await axios.get("http://localhost:5001/api/patient-forms");
                const data = Array.isArray(res.data) ? res.data : [];
                setPatientForms(data);
                // Initialize seen ids on first load
                if (seenPatientFormIds.current.size === 0) {
                    data.forEach(item => item && item._id && seenPatientFormIds.current.add(item._id));
                }
            } catch (err) {
                console.error("Error fetching patient forms:", err);
                setPatientForms([]);
                setPatientFormsError("Failed to load appointment requests");
            } finally {
                setPatientFormsLoading(false);
            }
        };

        fetchPatientForms();
        // Poll for new requests to trigger bell notifications
        const interval = setInterval(async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/patient-forms");
                const list = Array.isArray(res.data) ? res.data : [];
                // Detect new entries by unseen _id
                const newOnes = list.filter(x => x && x._id && !seenPatientFormIds.current.has(x._id));
                if (newOnes.length > 0) {
                    // Update seen set and current list
                    newOnes.forEach(x => seenPatientFormIds.current.add(x._id));
                    setPatientForms(list);
                    // Create notifications from new entries
                    setNotifications(prev => [
                        ...newOnes.map(x => ({
                            id: Date.now() + Math.random(),
                            title: "New Lab Request",
                            message: `${(x.firstName || '').trim()} ${(x.lastName || '').trim()} requested ${x.testType || 'a test'}`.trim(),
                            time: "Just now",
                            type: "request",
                            read: false
                        })),
                        ...prev
                    ]);
                    setUnreadNotifications(u => u + newOnes.length);
                }
            } catch (e) {
                // silent fail for polling
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Appointments from backend (reuse logic similar to AppointmentsPage.jsx)
    const [appointments, setAppointments] = useState({ upcoming: [], completed: [] });

    // Filter function for patient forms and appointments
    const getFilteredItems = (items) => {
        if (!searchQuery.trim()) return items;
        
        const query = searchQuery.toLowerCase().trim();
        
        return items.filter(item => {
            const searchableFields = {
                name: `${item.firstName || ''} ${item.lastName || ''} ${item.fullName || ''}`,
                test: item.testType || '',
                doctor: item.physician || '',
                status: item.status || '',
                priority: item.priority || '',
                id: item.patientId || '',
                email: item.email || '',
                phone: item.phone || '',
                notes: item.notes || '',
                age: item.age ? item.age.toString() : '',
                gender: item.gender || '',
                symptoms: item.symptoms || ''
            };

            return Object.values(searchableFields).some(value => 
                value.toString().toLowerCase().includes(query)
            );
        });
    };
    const [loading, setLoading] = useState(true);

    // Live stats derived from fetched data
    const stats = {
        newRequests: patientForms ? patientForms.length : 0,
        scheduled: (appointments?.upcoming || []).length,
        urgent: (patientForms || []).filter(p => p.urgencyLevel === 'Urgent').length,
        pendingResults: 3
    };
	const [selectedPatientForm, setSelectedPatientForm] = useState(null);
	const [isScheduleOpen, setIsScheduleOpen] = useState(false);
	const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
	const [selectedAppointmentForEmail, setSelectedAppointmentForEmail] = useState(null);
	const [isSendingEmail, setIsSendingEmail] = useState(false);

    const refreshAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/lab-appointments");
            const data = Array.isArray(res.data) ? res.data : [];

            const upcoming = data.filter(a => a.status !== "Completed");
            const completed = data.filter(a => a.status === "Completed");

            setAppointments({ upcoming, completed });
        } catch (err) {
            console.error("Error fetching appointments:", err);
            setAppointments({ upcoming: [], completed: [] });
        } finally {
            setLoading(false);
        }
    };

    // Email sending function using a simple email service
    const sendAppointmentEmail = async (appointment) => {
        try {
            setIsSendingEmail(true);
            
            // Create email content
            const emailContent = `
                Lab Appointment Confirmation
                
                Dear ${appointment.fullName},
                
                Your lab appointment has been confirmed. Please find the details below:
                
                Patient Name: ${appointment.fullName}
                Appointment Date: ${formatDate(appointment.appointmentDate)}
                Time: ${appointment.preferredTime || appointment.customTime || 'Not specified'}
                Test Type: ${appointment.testType}
                Lab Location: ${appointment.labLocation}
                Physician: ${appointment.physician || 'Not specified'}
                Priority: ${appointment.priority || 'Normal'}
                Status: ${appointment.status || 'Scheduled'}
                Reference Number: ${appointment.referenceNumber || 'Not assigned'}
                Insurance Provider: ${appointment.insuranceProvider || 'Not specified'}
                Insurance ID: ${appointment.insuranceId || 'Not specified'}
                Notes: ${appointment.notes || 'None'}
                
                Important Instructions:
                - Please arrive 15 minutes before your scheduled appointment time
                - Bring a valid ID and your insurance card (if applicable)
                - Follow any pre-test instructions provided by your physician
                - If you need to reschedule, please contact us at least 24 hours in advance
                
                If you have any questions or need to make changes to your appointment, please contact us immediately.
                
                Thank you for choosing MedicuraLab for your healthcare needs.
                
                MedicuraLab Team
                Phone: (555) 123-4567
                Email: info@medicuralab.com
                Website: www.medicuralab.com
            `;

            // Prepare email data for EmailJS
            const emailData = {
                to: appointment.email,
                subject: `Lab Appointment Confirmation - ${appointment.fullName} (${formatDate(appointment.appointmentDate)})`,
                text: emailContent,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1>🏥 MedicuraLab</h1>
                            <h2>Lab Appointment Confirmation</h2>
                        </div>
                        
                        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                            <p>Dear <strong>${appointment.fullName}</strong>,</p>
                            
                            <p>Your lab appointment has been confirmed. Please find the details below:</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3>📋 Appointment Details</h3>
                                <p><strong>Patient Name:</strong> ${appointment.fullName}</p>
                                <p><strong>Appointment Date:</strong> ${formatDate(appointment.appointmentDate)}</p>
                                <p><strong>Time:</strong> ${appointment.preferredTime || appointment.customTime || 'Not specified'}</p>
                                <p><strong>Test Type:</strong> ${appointment.testType}</p>
                                <p><strong>Lab Location:</strong> ${appointment.labLocation}</p>
                                <p><strong>Physician:</strong> ${appointment.physician || 'Not specified'}</p>
                                <p><strong>Priority:</strong> ${appointment.priority || 'Normal'}</p>
                                <p><strong>Status:</strong> ${appointment.status || 'Scheduled'}</p>
                                <p><strong>Reference Number:</strong> <strong>${appointment.referenceNumber || 'Not assigned'}</strong></p>
                                <p><strong>Insurance Provider:</strong> ${appointment.insuranceProvider || 'Not specified'}</p>
                                <p><strong>Insurance ID:</strong> ${appointment.insuranceId || 'Not specified'}</p>
                                <p><strong>Notes:</strong> ${appointment.notes || 'None'}</p>
                            </div>
                            
                            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4>📝 Important Instructions:</h4>
                                <ul>
                                    <li>Please arrive 15 minutes before your scheduled appointment time</li>
                                    <li>Bring a valid ID and your insurance card (if applicable)</li>
                                    <li>Follow any pre-test instructions provided by your physician</li>
                                    <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                                </ul>
                            </div>
                            
                            <p>If you have any questions or need to make changes to your appointment, please contact us immediately.</p>
                            
                            <p>Thank you for choosing MedicuraLab for your healthcare needs.</p>
                            
                            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                                <p><strong>MedicuraLab</strong><br>
                                📞 Phone: (555) 123-4567<br>
                                📧 Email: info@medicuralab.com<br>
                                🌐 Website: www.medicuralab.com</p>
                            </div>
                        </div>
                    </div>
                `,
                // Additional parameters for EmailJS template
                patient_name: appointment.fullName,
                appointment_date: formatDate(appointment.appointmentDate),
                appointment_time: appointment.preferredTime || appointment.customTime || 'Not specified',
                test_type: appointment.testType,
                lab_location: appointment.labLocation,
                physician: appointment.physician || 'Not specified',
                priority: appointment.priority || 'Normal',
                status: appointment.status || 'Scheduled',
                reference_number: appointment.referenceNumber || 'Not assigned',
                notes: appointment.notes || 'None',
                insurance_provider: appointment.insuranceProvider || 'Not specified',
                insurance_id: appointment.insuranceId || 'Not specified'
            };

            // Send email using the email service
            const result = await sendEmail(emailData);
            
            if (result.success) {
                alert("✅ Email sent successfully!");
                setIsEmailModalOpen(false);
                setSelectedAppointmentForEmail(null);
            } else {
                if (result.configError) {
                    const setupMessage = `❌ EmailJS Configuration Required

${result.error}

📋 QUICK SETUP (5 minutes):
1. Go to https://emailjs.com → Create free account
2. Add Gmail service → Copy Service ID
3. Create email template → Copy Template ID  
4. Get Public Key from Account settings
5. Update src/config/emailjs.config.js with your credentials

📖 See QUICK_EMAILJS_SETUP.md for detailed instructions

💡 Demo email preview available in browser console`;
                    
                    alert(setupMessage);
                    
                    // Log demo preview to console
                    if (result.demoPreview) {
                        console.log('📧 DEMO EMAIL PREVIEW:');
                        console.log('To:', result.demoPreview.to);
                        console.log('Subject:', result.demoPreview.subject);
                        console.log('HTML Content:', result.demoPreview.html);
                    }
                } else {
                    alert(`❌ Failed to send email: ${result.error}`);
                }
            }
            
        } catch (error) {
            console.error("Error sending email:", error);
            alert("❌ Error sending email. Please check your connection and try again.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    useEffect(() => {
        refreshAppointments();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border border-green-200';
            case 'Scheduled': return 'bg-purple-100 text-purple-700 border border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-100 text-red-700 border-l-4 border-red-500 font-semibold';
            case 'High': return 'bg-orange-100 text-orange-700 border-l-4 border-orange-500 font-semibold';
            case 'Normal': return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500';
            default: return 'bg-gray-100 text-gray-700 border-l-4 border-gray-500';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'Urgent': return '⚡';
            case 'High': return '▲';
            case 'Normal': return '●';
            default: return '○';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Filter states
    const [activeFilter, setActiveFilter] = useState('All');

    // Notifications state (seed with some examples if needed)
    const [notifications, setNotifications] = useState([
       
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Navigation Sidebar */}
            <nav className="fixed left-0 top-100 h-full w-64 bg-gradient-to-b from-green-700 to-purple-800 text-white p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-10">
                    <div className="bg-white p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">MedicuraLab</h1>
                </div>
                
                <div className="space-y-3">
                    <Link 
                        to="/lab" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/lab' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Dashboard</span>
                    </Link>
                    
                    <Link 
                        to="/appointments" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/appointments' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Appointments</span>
                    </Link>
                    
                    <Link 
                        to="/tests" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
                            location.pathname === '/tests' ? 'bg-blue-600/30 shadow-inner' : ''
                        }`}
                    >
                        <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="group-hover:translate-x-2 transition-transform font-medium">Tests</span>
                    </Link>
                </div>
                
            </nav>

            {/* Main Content */}
            <div className="ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-9">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src="/Labassistant.jpeg" alt="Profile" className="w-14 h-14 rounded-full border-4 border-white shadow-lg" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Randi Thathsarani</h2>
                                <p className="text-gray-600 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Lab Assistant
                                </p>
                            </div>
                            
                            {/* Notification Bell */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="relative p-3 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H9a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v2.5M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
                                    </svg>
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                        </span>
                                    )}
                                </button>
                                
                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                                <button
                                                    onClick={() => {
                                                        setUnreadNotifications(0);
                                                        // Mark all as read logic would go here
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                        !notification.read ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                                            notification.type === 'urgent' ? 'bg-red-500' :
                                                            notification.type === 'request' ? 'bg-blue-500' :
                                                            notification.type === 'appointment' ? 'bg-green-500' :
                                                            'bg-gray-500'
                                                        }`}></div>
                                                        <div className="flex-1">
                                                            <h4 className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                            <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                                                    if (!notification.read) {
                                                                        setUnreadNotifications(u => Math.max(0, u - 1));
                                                                    }
                                                                }}
                                                                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                                                                aria-label="Dismiss notification"
                                                                title="Dismiss"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 border-t border-gray-200">
                                            <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                                                View all notifications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, test type, doctor, status..."
                            className="w-96 pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                title="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Cards - Updated to use flex */}
                <div className="flex flex-wrap gap-6 mb-8">
                    {/* New Requests Card */}
                    <div className="flex-1 min-w-[250px] bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-4xl font-bold mb-2">{stats.newRequests}</div>
                                <div className="text-blue-100">New Requests</div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-blue-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            12% from yesterday
                        </div>
                    </div>
                    
                    {/* Scheduled Card */}
                    <div className="flex-1 min-w-[250px] bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-4xl font-bold mb-2">{stats.scheduled}</div>
                                <div className="text-green-100">Scheduled</div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-green-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            8% from yesterday
                        </div>
                    </div>
                    
                    {/* Urgent Card */}
                    <div className="flex-1 min-w-[250px] bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-4xl font-bold mb-2">{stats.urgent}</div>
                                <div className="text-orange-100">Urgent</div>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-orange-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                            3% from yesterday
                        </div>
                    </div>
                    
					{/** Removed Pending Results Card as requested **/}
                </div>

                {/* Appointment Requests */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Appointment Requests
                        </h3>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            {['All', 'New', 'Urgent'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        activeFilter === filter
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        {patientFormsLoading ? (
                            <div className="p-8 text-center text-gray-600">Loading appointment requests...</div>
                        ) : patientFormsError ? (
                            <div className="p-8 text-center text-red-600">{patientFormsError}</div>
                        ) : getFilteredItems(patientForms).length === 0 && searchQuery ? (
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No matching requests found</h3>
                                <p className="text-gray-600">
                                    No appointment requests match your search for "{searchQuery}".
                                    Try different keywords or clear the search.
                                </p>
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-all mx-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="py-4 px-6 font-semibold text-gray-700">Patient</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Test Type</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Requested Date</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredItems(patientForms)
                                        .filter(pf => {
                                            const statusLabel = (pf.urgencyLevel === 'Urgent') ? 'Urgent' : 'New';
                                            if (activeFilter === 'All') return true;
                                            if (activeFilter === 'Urgent') return statusLabel === 'Urgent';
                                            if (activeFilter === 'New') return statusLabel === 'New';
                                            return true;
                                        })
                                        .map((pf, index) => {
                                            const fullName = `${pf.firstName || ''} ${pf.lastName || ''}`.trim() || '—';
                                            const statusLabel = (pf.urgencyLevel === 'Urgent') ? 'Urgent' : 'New';
                                            return (
                                                <tr key={pf._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                                {fullName.charAt(0) || 'P'}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-800">{fullName}</div>
                                                                <div className="text-sm text-gray-500">Email: {pf.email || '—'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-medium">{pf.testType || '—'}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="font-medium">{formatDate(pf.preferredDate)}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            statusLabel === 'Urgent'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {statusLabel}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setSelectedPatientForm(pf)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                                                View
                                                            </button>
                                                            <button onClick={() => { setSelectedPatientForm(pf); setIsScheduleOpen(true); }} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                                                                Schedule
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Scheduled Appointments */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Scheduled Appointments
                        </h3>
                        <button 
                            onClick={openForm}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Appointment
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200">
                        {loading ? (
                            <div className="p-8 text-center text-gray-600">Loading appointments...</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-left">
                                        <th className="py-4 px-6 font-semibold text-gray-700">Patient</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Test Type</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Date & Time</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Doctor</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Priority</th>
                                        <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredItems(appointments.upcoming || []).map((appointment, index) => (
                                        <tr key={appointment._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                                                        {appointment.fullName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-800">{appointment.fullName}</div>
                                                        <div className="text-sm text-gray-500">ID: {appointment.patientId || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-800">{appointment.testType}</div>
                                                <div className="text-sm text-gray-500">{appointment.labType || 'General'}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-800">{formatDate(appointment.appointmentDate)}</div>
                                                <div className="text-sm text-gray-500">{appointment.preferredTime || '—'}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm mr-2">👨‍⚕️</div>
                                                    <span className="text-gray-800">{appointment.physician || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center w-min whitespace-nowrap ${getPriorityColor(appointment.priority || 'Normal')}`}>
                                                    <span className="mr-1">{getPriorityIcon(appointment.priority)}</span>
                                                    {appointment.priority || 'Normal'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-2 rounded-lg text-xs font-medium ${getStatusColor(appointment.status || 'Scheduled')}`}>
                                                        {appointment.status || 'Scheduled'}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAppointmentForEmail(appointment);
                                                            setIsEmailModalOpen(true);
                                                        }}
                                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                        title="Send Email"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Lab Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-screen overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                    Create New Lab Appointment
                                </h2>
                                <button
                                    onClick={closeForm}
                                    className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <LabForm onSuccess={closeForm} />
                        </div>
                    </div>
                )}

				{/* Patient Form View Modal */}
				{selectedPatientForm && !isScheduleOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
						<div className="bg-white rounded-2xl w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl">
							<div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
								<h2 className="text-2xl font-bold text-gray-800">Appointment Request Details</h2>
								<button
									onClick={() => setSelectedPatientForm(null)}
									className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
								>
									✕
								</button>
							</div>

							<div className="p-6 space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<div className="text-sm text-gray-500">First Name</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.firstName || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Last Name</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.lastName || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Email</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.email || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Phone Number</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.phoneNumber || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Date of Birth</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.dateOfBirth ? new Date(selectedPatientForm.dateOfBirth).toLocaleDateString() : '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Gender</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.gender || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Preferred Date</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.preferredDate ? new Date(selectedPatientForm.preferredDate).toLocaleDateString() : '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Preferred Time</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.preferredTime || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Custom Time</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.customTime || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Test Type</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.testType || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Urgency Level</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.urgencyLevel || 'Normal'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Referring Doctor</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.referringDoctor || '—'}</div>
									</div>
									<div>
										<div className="text-sm text-gray-500">Insurance Provider</div>
										<div className="font-medium text-gray-900">{selectedPatientForm.insuranceProvider || '—'}</div>
									</div>
								</div>

								<div>
									<div className="text-sm text-gray-500 mb-1">Special Requirements</div>
									<div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 whitespace-pre-wrap">
										{selectedPatientForm.specialRequirements || '—'}
									</div>
								</div>

								<div>
									<div className="text-sm text-gray-500 mb-1">Contact Preference</div>
									<div className="flex flex-wrap gap-2">
										{(selectedPatientForm.contactPreference || []).length > 0 ? (
											(selectedPatientForm.contactPreference || []).map((cp, idx) => (
												<span key={idx} className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">{cp}</span>
											))
										) : (
											<span className="text-gray-600">—</span>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Split Schedule Modal: Patient details left, LabForm right */}
				{selectedPatientForm && isScheduleOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
						<div className="bg-white w-full h-full shadow-2xl">
							<div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
								<h2 className="text-xl font-bold text-gray-800">Schedule Appointment</h2>
								<button
									onClick={() => { setIsScheduleOpen(false); setSelectedPatientForm(null); }}
									className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
								>
									✕
								</button>
							</div>
							<div className="flex h-[calc(100vh-64px)]">
								<div className="w-1/2 overflow-y-auto border-r border-gray-200 p-6">
									<h3 className="text-lg font-semibold mb-4">Form 1: Patient Request (read-only)</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<div className="text-sm text-gray-500">First Name</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.firstName || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Last Name</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.lastName || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Email</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.email || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Phone Number</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.phoneNumber || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Date of Birth</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.dateOfBirth ? new Date(selectedPatientForm.dateOfBirth).toLocaleDateString() : '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Gender</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.gender || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Preferred Date</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.preferredDate ? new Date(selectedPatientForm.preferredDate).toLocaleDateString() : '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Preferred Time</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.preferredTime || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Custom Time</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.customTime || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Test Type</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.testType || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Urgency Level</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.urgencyLevel || 'Normal'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Referring Doctor</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.referringDoctor || '—'}</div>
										</div>
										<div>
											<div className="text-sm text-gray-500">Insurance Provider</div>
											<div className="font-medium text-gray-900">{selectedPatientForm.insuranceProvider || '—'}</div>
										</div>
									</div>

									<div className="mt-6">
										<div className="text-sm text-gray-500 mb-1">Special Requirements</div>
										<div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 whitespace-pre-wrap">
											{selectedPatientForm.specialRequirements || '—'}
										</div>
									</div>

									<div className="mt-4">
										<div className="text-sm text-gray-500 mb-1">Contact Preference</div>
										<div className="flex flex-wrap gap-2">
											{(selectedPatientForm.contactPreference || []).length > 0 ? (
												(selectedPatientForm.contactPreference || []).map((cp, idx) => (
													<span key={idx} className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">{cp}</span>
												))
											) : (
												<span className="text-gray-600">—</span>
											)}
										</div>
									</div>
								</div>
								<div className="w-1/2 overflow-y-auto p-6 bg-gray-50">
									<h3 className="text-lg font-semibold mb-4">Form 2: Create Scheduled Appointment</h3>
									<LabForm
										initialData={selectedPatientForm}
										onSuccess={async () => {
											// After scheduling, remove the request and refresh the list
											try {
												if (selectedPatientForm && selectedPatientForm._id) {
													await axios.delete(`http://localhost:5001/api/patient-forms/${selectedPatientForm._id}`);
												}
												// Refresh local patient forms
												const res = await axios.get("http://localhost:5001/api/patient-forms");
												setPatientForms(Array.isArray(res.data) ? res.data : []);
												await refreshAppointments();
												setIsScheduleOpen(false);
												setSelectedPatientForm(null);
											} catch (err) {
												console.error("Failed to remove scheduled request:", err);
											}
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Email Modal */}
				{selectedAppointmentForEmail && isEmailModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
						<div className="bg-white rounded-2xl w-full max-w-4xl max-h-screen overflow-y-auto shadow-2xl">
							<div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
								<h2 className="text-2xl font-bold text-gray-800">Send Appointment Email</h2>
								<button
									onClick={() => { setIsEmailModalOpen(false); setSelectedAppointmentForEmail(null); }}
									className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
								>
									✕
								</button>
							</div>

							<div className="p-6 space-y-6">
								<div className="bg-blue-50 p-4 rounded-lg">
									<h3 className="text-lg font-semibold text-blue-800 mb-2">Email Recipient</h3>
									<p className="text-blue-700">{selectedAppointmentForEmail.email}</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
										<div className="space-y-3">
											<div>
												<span className="text-sm text-gray-500">Patient Name:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.fullName}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Appointment Date:</span>
												<div className="font-medium text-gray-900">{formatDate(selectedAppointmentForEmail.appointmentDate)}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Time:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.preferredTime || selectedAppointmentForEmail.customTime || 'Not specified'}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Test Type:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.testType}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Lab Location:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.labLocation}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Physician:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.physician || 'Not specified'}</div>
											</div>
										</div>
									</div>

									<div>
										<h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
										<div className="space-y-3">
											<div>
												<span className="text-sm text-gray-500">Priority:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.priority || 'Normal'}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Status:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.status || 'Scheduled'}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Reference Number:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.referenceNumber || 'Not assigned'}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Insurance Provider:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.insuranceProvider || 'Not specified'}</div>
											</div>
											<div>
												<span className="text-sm text-gray-500">Insurance ID:</span>
												<div className="font-medium text-gray-900">{selectedAppointmentForEmail.insuranceId || 'Not specified'}</div>
											</div>
										</div>
									</div>
								</div>

								{selectedAppointmentForEmail.notes && (
									<div>
										<span className="text-sm text-gray-500">Notes:</span>
										<div className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 whitespace-pre-wrap">
											{selectedAppointmentForEmail.notes}
										</div>
									</div>
								)}

								<div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
									<button
										onClick={() => { setIsEmailModalOpen(false); setSelectedAppointmentForEmail(null); }}
										className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={() => sendAppointmentEmail(selectedAppointmentForEmail)}
										disabled={isSendingEmail}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
									>
										{isSendingEmail ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Sending...
											</>
										) : (
											<>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
												</svg>
												Send Email
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
            </div>
        </div>
    );
};

export default LabAssistant;