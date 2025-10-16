import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import LabForm from './LabForm';

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [appointments, setAppointments] = useState({ upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const location = useLocation();
  const notificationRef = useRef(null);

  // Patient-form requests from Medicura2-main backend
  const [patientForms, setPatientForms] = useState([]);
  const [patientFormsLoading, setPatientFormsLoading] = useState(true);
  const [patientFormsError, setPatientFormsError] = useState("");
  const seenPatientFormIds = useRef(new Set());

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Live stats derived from fetched data
  const stats = {
    newRequests: patientForms ? patientForms.length : 0,
    scheduled: (appointments?.upcoming || []).length,
    urgent: (patientForms || []).filter(p => p.urgencyLevel === 'Urgent').length,
    pendingResults: 3
  };

  // Handle click outside to close bell notification dropdown
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

  // ✅ Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/lab-appointments");
        const data = Array.isArray(res.data) ? res.data : [];

        // Split into upcoming vs completed
        const upcoming = data.filter(a => a.status !== "Completed");
        const completed = data.filter(a => a.status === "Completed");

        setAppointments({ upcoming, completed });
        console.log("Appointments loaded:", { upcoming: upcoming.length, completed: completed.length });
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments({ upcoming: [], completed: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch patient forms and poll for new requests
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

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  // ✅ View appointment function
  const viewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // ✅ Close view modal function
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAppointment(null);
  };

  // ✅ Edit appointment function
  const editAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      fullName: appointment.fullName || '',
      age: appointment.age || '',
      email: appointment.email || '',
      phone: appointment.phone || '',
      gender: appointment.gender || '',
      testType: appointment.testType || '',
      labLocation: appointment.labLocation || '',
      appointmentDate: appointment.appointmentDate || '',
      preferredTime: appointment.preferredTime || '',
      customTime: appointment.customTime || '',
      notes: appointment.notes || '',
      insuranceProvider: appointment.insuranceProvider || '',
      insuranceId: appointment.insuranceId || '',
      physician: appointment.physician || '',
      priority: appointment.priority || 'Normal',
      status: appointment.status || 'Scheduled',
      terms: appointment.terms || false
    });
    setIsEditModalOpen(true);
  };

  // ✅ Close edit modal function
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAppointment(null);
    setEditFormData({});
  };

  // ✅ Update appointment function
  const updateAppointment = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.put(`http://localhost:5000/api/lab-appointments/${selectedAppointment._id}`, editFormData);

      const updated = response.data.appointment;

      // Update local state and move between Upcoming/Completed based on status
      setAppointments(prev => {
        const removedFromUpcoming = prev.upcoming.filter(apt => apt._id !== updated._id);
        const removedFromCompleted = prev.completed.filter(apt => apt._id !== updated._id);

        if (updated.status === 'Completed') {
          return {
            upcoming: removedFromUpcoming,
            completed: [updated, ...removedFromCompleted]
          };
        }
        // Default to Scheduled → stays in upcoming
        return {
          upcoming: [updated, ...removedFromUpcoming],
          completed: removedFromCompleted
        };
      });

      closeEditModal();
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Handle form input changes
  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ Delete appointment function
  const deleteAppointment = async (appointmentId, patientName) => {
    if (window.confirm(`Are you sure you want to delete the appointment for ${patientName}? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/lab-appointments/${appointmentId}`);
        
        // Update local state to remove deleted appointment
        setAppointments(prev => ({
          upcoming: prev.upcoming.filter(apt => apt._id !== appointmentId),
          completed: prev.completed.filter(apt => apt._id !== appointmentId)
        }));
        
        // Show success message (you could add a toast notification here)
        alert('Appointment deleted successfully!');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  // ✅ Enhanced status colors with better styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
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

  // ✅ Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent': return '⚡';
      case 'High': return '▲';
      case 'Normal': return '●';
      default: return '○';
    }
  };

  // ✅ Inline status update from table cell
  const handleInlineStatusChange = async (appointment, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/lab-appointments/${appointment._id}`, { status: newStatus });
      const updated = response.data.appointment;

      setAppointments(prev => {
        const removedFromUpcoming = prev.upcoming.filter(apt => apt._id !== updated._id);
        const removedFromCompleted = prev.completed.filter(apt => apt._id !== updated._id);

        if (updated.status === 'Completed') {
          return {
            upcoming: removedFromUpcoming,
            completed: [updated, ...removedFromCompleted]
          };
        }
        return {
          upcoming: [updated, ...removedFromUpcoming],
          completed: removedFromCompleted
        };
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // ✅ Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter appointments based on search query
  const getFilteredAppointments = (appointmentsList) => {
    if (!searchQuery.trim()) return appointmentsList;
    
    const query = searchQuery.toLowerCase().trim();
    
    return appointmentsList.filter(appointment => {
      const searchableFields = {
        name: appointment.fullName || '',
        test: appointment.testType || '',
        doctor: appointment.physician || '',
        status: appointment.status || '',
        priority: appointment.priority || '',
        id: appointment.patientId || '',
        location: appointment.labLocation || '',
        email: appointment.email || '',
        phone: appointment.phone || '',
        notes: appointment.notes || ''
      };

      // Check each field individually for better matching
      return Object.values(searchableFields).some(value => 
        value.toString().toLowerCase().includes(query)
      );
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-700 to-purple-800 text-white p-6 shadow-xl">
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
            to="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-blue-600/30 hover:scale-105 group ${
              location.pathname === '/' ? 'bg-blue-600/30 shadow-inner' : ''
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
          
          <Link 
            to="/logout" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-red-500/30 hover:scale-105 group mt-8"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="group-hover:translate-x-2 transition-transform font-medium">Logout</span>
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
                            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
                              notification.type === 'appointment' ? 'bg-blue-500' :
                              notification.type === 'reminder' ? 'bg-green-500' :
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
              className="w-96 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 hover:border-blue-300"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 min-w-[250px] bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-bold mb-2">{stats.newRequests}</div>
                <div className="text-blue-100">New Requests</div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Active appointments
            </div>
          </div>
          
          <div className="flex-1 min-w-[250px] bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-bold mb-2">{stats.scheduled}</div>
                <div className="text-green-100">Scheduled</div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-green-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Finished appointments
            </div>
          </div>
          
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
              Priority cases
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointment Management
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

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { key: 'upcoming', label: 'Upcoming Appointments', count: appointments.upcoming.length },
                { key: 'completed', label: 'Completed Appointments', count: appointments.completed.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-1 px-2 rounded-full text-xs font-semibold ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Appointments Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="py-4 px-6 font-semibold text-gray-700">Patient</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Test Type</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Date & Time</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Doctor</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Priority</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAppointments(appointments[activeTab] || []).map((appointment, index) => (
                  <tr key={appointment._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-semibold">
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
                      <div className="font-medium text-gray-800">
                        {formatDate(appointment.appointmentDate)}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.preferredTime || '—'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm mr-2">
                          👨‍⚕️
                        </div>
                        <span className="text-gray-800">{appointment.physician || "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center w-min whitespace-nowrap ${getPriorityColor(appointment.priority || "Normal")}`}>
                        <span className="mr-1">{getPriorityIcon(appointment.priority)}</span>
                        {appointment.priority || "Normal"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={appointment.status || 'Scheduled'}
                        onChange={(e) => handleInlineStatusChange(appointment, e.target.value)}
                        className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editAppointment(appointment)}
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors group"
                          title="Edit appointment"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => viewAppointment(appointment)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors group"
                          title="View appointment details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteAppointment(appointment._id, appointment.fullName)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors group"
                          title="Delete appointment"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {getFilteredAppointments(appointments[activeTab] || []).length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">{searchQuery ? '�' : '�📅'}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery 
                  ? "No matching appointments found"
                  : `No ${activeTab} appointments`
                }
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No appointments match your search for "${searchQuery}". Try different keywords or clear the search.`
                  : activeTab === 'upcoming' 
                    ? "You're all caught up! No upcoming appointments scheduled."
                    : "No appointments have been completed yet."
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={openForm}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Schedule New Appointment
                </button>
              )}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-all mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Search
                </button>
              )}
            </div>
          )}
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

        {/* View Appointment Details Modal */}
        {isViewModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Appointment Details
                </h2>
                <button
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {/* Patient Information Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {selectedAppointment.fullName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedAppointment.fullName}</h3>
                      <p className="text-gray-600">Patient ID: {selectedAppointment.patientId || 'Not assigned'}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedAppointment.status || "Scheduled")}`}>
                        {selectedAppointment.status || "Scheduled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{selectedAppointment.age || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium">{selectedAppointment.gender || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-blue-600">{selectedAppointment.email || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedAppointment.phone || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Appointment Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Test Type:</span>
                        <span className="font-medium">{selectedAppointment.testType || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lab Location:</span>
                        <span className="font-medium">{selectedAppointment.labLocation || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lab Type:</span>
                        <span className="font-medium">{selectedAppointment.labType || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{formatDate(selectedAppointment.appointmentDate) || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{selectedAppointment.preferredTime || selectedAppointment.customTime || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Medical Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Physician:</span>
                        <span className="font-medium">{selectedAppointment.physician || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center w-min whitespace-nowrap ${getPriorityColor(selectedAppointment.priority || "Normal")}`}>
                          <span className="mr-1">{getPriorityIcon(selectedAppointment.priority)}</span>
                          {selectedAppointment.priority || "Normal"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance Provider:</span>
                        <span className="font-medium">{selectedAppointment.insuranceProvider || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance ID:</span>
                        <span className="font-medium">{selectedAppointment.insuranceId || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Additional Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 block mb-2">Reference Number:</span>
                        <span className="font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm">
                          {selectedAppointment.referenceNumber || 'Not assigned'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-2">Notes:</span>
                        <span className="font-medium">
                          {selectedAppointment.notes || 'No additional notes'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terms Accepted:</span>
                        <span className={`font-medium ${selectedAppointment.terms ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedAppointment.terms ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeViewModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // You can add edit functionality here later
                      alert('Edit functionality can be added here');
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Edit Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Appointment Modal */}
        {isEditModalOpen && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600">
                  Edit Appointment
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {/* Patient Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={editFormData.fullName || ''}
                        onChange={(e) => handleEditInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                      <input
                        type="number"
                        value={editFormData.age || ''}
                        onChange={(e) => handleEditInputChange('age', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={editFormData.phone || ''}
                        onChange={(e) => handleEditInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <select
                        value={editFormData.gender || ''}
                        onChange={(e) => handleEditInputChange('gender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Appointment Details Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Type *</label>
                      <input
                        type="text"
                        value={editFormData.testType || ''}
                        onChange={(e) => handleEditInputChange('testType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lab Location *</label>
                      <input
                        type="text"
                        value={editFormData.labLocation || ''}
                        onChange={(e) => handleEditInputChange('labLocation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date *</label>
                      <input
                        type="date"
                        value={editFormData.appointmentDate || ''}
                        onChange={(e) => handleEditInputChange('appointmentDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <select
                        value={editFormData.preferredTime || ''}
                        onChange={(e) => handleEditInputChange('preferredTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="Custom">Custom Time</option>
                      </select>
                    </div>
                    {editFormData.preferredTime === 'Custom' && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Time</label>
                        <input
                          type="text"
                          value={editFormData.customTime || ''}
                          onChange={(e) => handleEditInputChange('customTime', e.target.value)}
                          placeholder="e.g., 2:30 PM"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Physician</label>
                      <input
                        type="text"
                        value={editFormData.physician || ''}
                        onChange={(e) => handleEditInputChange('physician', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={editFormData.priority || 'Normal'}
                        onChange={(e) => handleEditInputChange('priority', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editFormData.status || 'Scheduled'}
                        onChange={(e) => handleEditInputChange('status', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Insurance Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Insurance Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                      <input
                        type="text"
                        value={editFormData.insuranceProvider || ''}
                        onChange={(e) => handleEditInputChange('insuranceProvider', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insurance ID</label>
                      <input
                        type="text"
                        value={editFormData.insuranceId || ''}
                        onChange={(e) => handleEditInputChange('insuranceId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Additional Notes
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={editFormData.notes || ''}
                      onChange={(e) => handleEditInputChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any additional notes or special requirements..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeEditModal}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateAppointment}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Update Appointment
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

export default AppointmentsPage;