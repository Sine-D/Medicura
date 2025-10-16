// Updated frontend/src/components/SupplierDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Menu,
  X,
  FileText,
  Truck,
  Home,
  Users,
  User,
  Bell,
  Settings,
  Shield,
  Key,
  LogOut,
  Activity,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import SupplierInvoiceRequests from "./SupplierInvoiceRequests";
import SupplierInvoices from "./SupplierInvoices";
import DashboardOverview from "./DashboardOverview";
import ClientDirectory from "./ClientDirectory";
import UserProfile from "./SupplierUserProfile";
import { NotificationProvider, useNotifications } from "../contexts/NotificationContext.jsx";
import NotificationDropdown from "./NotificationDropdown";

const SupplierDashboardContent = () => {
  const { unreadCount, addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showSupportPreview, setShowSupportPreview] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState(null);
  const [replyForm, setReplyForm] = useState({ message: "" });
  const [showPreviewSettings, setShowPreviewSettings] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Support form state
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: ""
  });

  // Handle support form submission
  const handleSupportSubmit = () => {
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      addNotification({
        type: 'error',
        title: 'Form Incomplete',
        message: 'Please fill in both subject and message fields.',
        priority: 'medium'
      });
      return;
    }

    // Add success notification
    addNotification({
      type: 'support',
      title: 'Support Request Sent',
      message: `Your support request "${supportForm.subject}" has been submitted successfully. Our team will get back to you within 24 hours.`,
      priority: 'high',
      supportData: {
        subject: supportForm.subject,
        message: supportForm.message,
        submittedAt: new Date(),
        status: 'pending'
      }
    });

    // Reset form and close modal
    setSupportForm({ subject: "", message: "" });
    setShowSupportModal(false);
  };

  // Handle support form input changes
  const handleSupportFormChange = (field, value) => {
    setSupportForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle viewing support request
  const handleViewSupportRequest = (notification) => {
    setSelectedSupportRequest(notification);
    setShowSupportPreview(true);
  };

  // Handle opening reply modal
  const handleOpenReplyModal = () => {
    setShowReplyModal(true);
  };

  // Handle reply form input changes
  const handleReplyFormChange = (value) => {
    // Limit to 1000 characters
    if (value.length <= 1000) {
      setReplyForm({ message: value });
    }
  };

  // Handle reply submission
  const handleSubmitReply = () => {
    if (!replyForm.message.trim()) {
      addNotification({
        type: 'error',
        title: 'Reply Required',
        message: 'Please enter a reply message before sending.',
        priority: 'medium'
      });
      return;
    }

    // Add success notification
    addNotification({
      type: 'success',
      title: 'Reply Sent Successfully',
      message: `Your reply to "${selectedSupportRequest.supportData.subject}" has been sent to our support team.`,
      priority: 'high'
    });

    // Reset form and close modals
    setReplyForm({ message: "" });
    setShowReplyModal(false);
    setShowSupportPreview(false);
    setSelectedSupportRequest(null);
  };

  // Handle closing reply modal
  const handleCloseReplyModal = () => {
    setReplyForm({ message: "" });
    setShowReplyModal(false);
  };

  // Profile data for preview settings
  const [profileData] = useState({
    firstName: "Navodya",
    lastName: "Abeywickrama",
    email: "navodya.abeywickrama@medicura.lk",
    phone: "+94 77 123 4567",
    position: "Senior Supplier Manager",
    department: "Supply Chain Management",
    employeeId: "SUP-2025-001",
    isVerified: true,
    twoFactorEnabled: false,
    notifications: {
      email: true,
      sms: true,
      push: false,
      marketing: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Handle URL parameters for navigation and actions
  useEffect(() => {
    const tab = searchParams.get('tab');
    const action = searchParams.get('action');
    const search = searchParams.get('search');
    
    if (tab && ['dashboard', 'requests', 'invoices', 'clients', 'profile'].includes(tab)) {
      setActiveLink(tab);
    }
    
    // Handle actions like opening create modal
    if (action === 'create' && tab === 'invoices') {
      // This would trigger the create invoice modal in the invoices component
      console.log('Create invoice action triggered');
    }
    
    // Handle search parameters
    if (search) {
      console.log('Search term:', search);
    }
  }, [searchParams]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowSecuritySettings(false);
      alert("Password changed successfully!");
    } catch (error) {
      alert("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const content = () => {
    switch (activeLink) {
      case "dashboard":
        return <DashboardOverview />;
      case "requests":
        return <SupplierInvoiceRequests />;
      case "invoices":
        return <SupplierInvoices />;
      case "clients":
        return <ClientDirectory />;
      case "profile":
        return <UserProfile />;
      default:
        return <DashboardOverview />;
    }
  };

  const NavLink = ({ href, icon, children, id }) => {
    const Icon = icon;
    const isActive = activeLink === id;
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          setActiveLink(id);
          setIsOpen(false); // close sidebar on mobile
          // Update URL parameters
          setSearchParams({ tab: id });
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold shadow-lg"
            : "text-blue-100 hover:bg-blue-700/40 hover:scale-[1.03]"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{children}</span>
        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-blue-300 ml-auto" />
        )}
      </a>
    );
  };

  const Nav = () => (
    <nav className="flex flex-col space-y-1.5 mt-8">
      <NavLink href="#dashboard" icon={Home} id="dashboard">
        Dashboard
      </NavLink>
      <NavLink href="#requests" icon={Truck} id="requests">
        Request Management
      </NavLink>
      <NavLink href="#invoices" icon={FileText} id="invoices">
        Invoice Management
      </NavLink>
      <NavLink href="#clients" icon={Users} id="clients">
        Client Directory
      </NavLink>
      <NavLink href="#profile" icon={User} id="profile">
        Profile
      </NavLink>
    </nav>
  );

  const getPageTitle = () => {
    switch (activeLink) {
      case "dashboard":
        return "Dashboard Overview";
      case "requests":
        return "Request Management";
      case "invoices":
        return "Invoice Management";
      case "clients":
        return "Client Directory";
      case "profile":
        return "User Profile";
      default:
        return "Dashboard Overview";
    }
  };

  const getPageDescription = () => {
    switch (activeLink) {
      case "dashboard":
        return "Manage your dashboard efficiently";
      case "requests":
        return "Manage your requests efficiently";
      case "invoices":
        return "Manage your invoices efficiently";
      case "clients":
        return "Manage your clients efficiently";
      case "profile":
        return "Manage your account information";
      default:
        return "Manage your dashboard efficiently";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 flex items-center justify-between z-20 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800">
          Supplier Portal
        </h1>
        <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="p-1.5 rounded-full bg-gray-100 text-gray-600 relative hover:bg-gray-200 transition-colors"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full border-2 border-white flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)}
                onViewSupportRequest={handleViewSupportRequest}
              />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 w-72 bg-slate-800 transform transition-transform duration-300 ease-in-out pt-16 lg:pt-0 shadow-xl`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              SP
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Supplier Portal
              </h2>
              <p className="text-sm text-blue-200">Professional Tier</p>
            </div>
          </div>
          <Nav />

          <div className="mt-auto pt-8">
            <div className="bg-slate-700/30 rounded-lg p-4 mt-8">
              <p className="text-sm text-blue-100 mb-2">Need assistance?</p>
              <button
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-md font-semibold text-sm hover:from-blue-700 hover:to-blue-500 shadow-md transition-colors"
                onClick={() => setShowSupportModal(true)}
              >
                <span className="inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                  Contact Support
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-0 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Content */}
      <main className="flex-1 pt-20 lg:pt-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-800">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600">
                {getPageDescription()}
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="relative">
                <button
                  className="p-2 rounded-full bg-gray-100 text-gray-600 relative hover:bg-gray-200 transition-colors"
                  onClick={() => setShowNotifications((prev) => !prev)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full border-2 border-white flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)}
                  onViewSupportRequest={handleViewSupportRequest}
                />
              </div>
              <div className="relative">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    NA
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Navodya Abeywickrama
                    </p>
                    <p className="text-xs text-gray-500">Senior Supplier Manager</p>
                  </div>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-30 p-4">
                    <p className="font-semibold mb-2">Profile</p>
                    <ul className="text-sm text-gray-700">
                      <li
                        className="py-1 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => {
                          setActiveLink('profile');
                          setShowProfileMenu(false);
                        }}
                      >
                        View Profile
                      </li>
                      <li
                        className="py-1 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => {
                          setShowPreviewSettings(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        Settings
                      </li>
                      <li
                        className="py-1 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={() => {
                          alert('You have been logged out.');
                          setShowProfileMenu(false);
                        }}
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            {content()}
          </div>
        </div>
      </main>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Contact Support</h2>
              <button
                onClick={() => {
                  setSupportForm({ subject: "", message: "" });
                  setShowSupportModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={supportForm.subject}
                    onChange={(e) => handleSupportFormChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What can we help you with?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={supportForm.message}
                    onChange={(e) => handleSupportFormChange('message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setSupportForm({ subject: "", message: "" });
                      setShowSupportModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSupportSubmit}
                    disabled={!supportForm.subject.trim() || !supportForm.message.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Preview Modal */}
      {showSupportPreview && selectedSupportRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Support Request Details</h2>
              <button
                onClick={() => {
                  setShowSupportPreview(false);
                  setSelectedSupportRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Request Info */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Support Request</span>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      {selectedSupportRequest.supportData?.status || 'Pending'}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    Submitted on {selectedSupportRequest.supportData?.submittedAt?.toLocaleDateString()} at {selectedSupportRequest.supportData?.submittedAt?.toLocaleTimeString()}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-gray-900">{selectedSupportRequest.supportData?.subject}</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[120px]">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedSupportRequest.supportData?.message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowSupportPreview(false);
                      setSelectedSupportRequest(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleOpenReplyModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedSupportRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Reply to Support Request</h2>
              <button
                onClick={handleCloseReplyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Original Request Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Original Request</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {selectedSupportRequest.supportData?.subject}
                  </div>
                  <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                    <strong>Message:</strong> {selectedSupportRequest.supportData?.message}
                  </div>
                </div>

                {/* Reply Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={replyForm.message}
                    onChange={(e) => handleReplyFormChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && replyForm.message.trim()) {
                        handleSubmitReply();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Type your reply here... (Ctrl+Enter to send)"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">
                      Please provide additional details or ask follow-up questions.
                    </p>
                    <p className="text-xs text-gray-400">
                      {replyForm.message.length}/1000
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={handleCloseReplyModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={!replyForm.message.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Settings Modal */}
      {showPreviewSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Settings Preview</h3>
              <button
                onClick={() => setShowPreviewSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Profile Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          NA
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{profileData.firstName} {profileData.lastName}</p>
                          <p className="text-sm text-gray-600">{profileData.position}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{profileData.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{profileData.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{profileData.employeeId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Quick Actions
                    </h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setShowPreviewSettings(false);
                          setShowSecuritySettings(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="w-5 h-5 text-blue-600" />
                        Security Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowPreviewSettings(false);
                          setActiveLink('profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-green-600" />
                        View Full Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowPreviewSettings(false);
                          setShowNotifications(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Bell className="w-5 h-5 text-yellow-600" />
                        Notification Settings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Account Status
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Account Status</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verification</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security Level</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Shield className="w-3 h-3" />
                          High
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">2FA Status</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          profileData.twoFactorEnabled 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {profileData.twoFactorEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Notifications</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          profileData.notifications.email 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {profileData.notifications.email ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">SMS Notifications</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          profileData.notifications.sms 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {profileData.notifications.sms ? "On" : "Off"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Push Notifications</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          profileData.notifications.push 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {profileData.notifications.push ? "On" : "Off"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreviewSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecuritySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <button
                onClick={() => setShowSecuritySettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    profileData.twoFactorEnabled 
                      ? "bg-green-100 text-green-700 border border-green-200" 
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {profileData.twoFactorEnabled ? "Enabled" : "Enable"}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Password Strength</h4>
                    <p className="text-sm text-gray-600">Your password meets security requirements</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3" />
                  Strong
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Login Activity</h4>
                    <p className="text-sm text-gray-600">Monitor your account access</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  View Activity
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Sign Out All Devices</h4>
                    <p className="text-sm text-gray-600">Sign out from all devices except this one</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  Sign Out All
                </button>
              </div>

              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSecuritySettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SupplierDashboard = () => {
  return (
    <NotificationProvider>
      <SupplierDashboardContent />
    </NotificationProvider>
  );
};

export default SupplierDashboard;