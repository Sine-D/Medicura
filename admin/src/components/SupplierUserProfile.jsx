import React, { useState } from "react";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Shield,
  Settings,
  Camera,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Key,
  Bell,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Award,
  Star,
  Globe,
  CreditCard,
  FileText,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  LogOut,
  UserCheck,
  IdCard,
  Home,
  Briefcase
} from "lucide-react";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Navodya Abeywickrama's profile data
  const [profileData, setProfileData] = useState({
    firstName: "Navodya",
    lastName: "Abeywickrama",
    email: "navodya.abeywickrama@medicura.lk",
    phone: "+94 77 123 4567",
    nic: "901234567V",
    address: "123/5, Galle Road, Colombo 03, Sri Lanka",
    city: "Colombo",
    district: "Colombo",
    province: "Western Province",
    postalCode: "00300",
    department: "Supply Chain Management",
    position: "Senior Supplier Manager",
    employeeId: "SUP-2025-001",
    joinDate: "2022-03-15",
    lastLogin: "2024-12-25 14:30",
    profileImage: null,
    isVerified: true,
    twoFactorEnabled: false,
    notifications: {
      email: true,
      sms: true,
      push: false,
      marketing: false
    }
  });

  const [formData, setFormData] = useState(profileData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(profileData);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfileData(formData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(profileData);
  };

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
      setShowPasswordForm(false);
      alert("Password changed successfully!");
    } catch (error) {
      alert("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const exportProfileData = () => {
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Activity timeline data
  const activities = [
    { id: 1, action: "Logged in", time: "2024-12-25 14:30", type: "login" },
    { id: 2, action: "Updated client information", time: "2024-12-25 10:15", type: "update" },
    { id: 3, action: "Created new invoice", time: "2024-12-24 16:45", type: "create" },
    { id: 4, action: "Approved inventory request", time: "2024-12-24 09:30", type: "approve" },
    { id: 5, action: "Changed password", time: "2024-12-23 11:20", type: "security" }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "login": return <LogOut className="w-4 h-4" />;
      case "update": return <Edit className="w-4 h-4" />;
      case "create": return <FileText className="w-4 h-4" />;
      case "approve": return <CheckCircle className="w-4 h-4" />;
      case "security": return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "login": return "text-green-600 bg-green-100";
      case "update": return "text-blue-600 bg-blue-100";
      case "create": return "text-purple-600 bg-purple-100";
      case "approve": return "text-yellow-600 bg-yellow-100";
      case "security": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          </div>
          <p className="text-gray-600">Manage your account information, security settings, and preferences</p>
        </div>

        {/* Profile Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Verification</p>
                <p className="text-2xl font-bold text-blue-600">Verified</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Security Level</p>
                <p className="text-2xl font-bold text-yellow-600">High</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-2xl font-bold text-indigo-600">Today</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.profileImage ? (
                        <img 
                          src={profileData.profileImage} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        "NA"
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2">{profileData.position}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {profileData.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <IdCard className="w-4 h-4" />
                        {profileData.employeeId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={isEditing ? formData.firstName : profileData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={isEditing ? formData.lastName : profileData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={isEditing ? formData.email : profileData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
                      type="tel"
                      value={isEditing ? formData.phone : profileData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
            <input
                      type="text"
                      value={isEditing ? formData.nic : profileData.nic}
                      onChange={(e) => setFormData({...formData, nic: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
                      type="text"
                      value={isEditing ? formData.department : profileData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={isEditing ? formData.address : profileData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Key className="w-5 h-5" />
                  Change Password
                </button>
                
                <button
                  onClick={() => setShowSecurity(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Security Settings
                </button>
                
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
                
                <button
                  onClick={exportProfileData}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Employee ID</span>
                  <span className="text-sm font-medium text-gray-900">{profileData.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Join Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(profileData.lastLogin).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
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

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPasswordForm(false)}
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

        {/* Security Settings Modal */}
        {showSecurity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                <button
                  onClick={() => setShowSecurity(false)}
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
                    onClick={() => setProfileData(prev => ({...prev, twoFactorEnabled: !prev.twoFactorEnabled}))}
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
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSecurity(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings Modal */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive important updates via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({
                      ...prev, 
                      notifications: {...prev.notifications, email: !prev.notifications.email}
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      profileData.notifications.email 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {profileData.notifications.email ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Receive urgent alerts via SMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({
                      ...prev, 
                      notifications: {...prev.notifications, sms: !prev.notifications.sms}
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      profileData.notifications.sms 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {profileData.notifications.sms ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-600">Receive browser notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({
                      ...prev, 
                      notifications: {...prev.notifications, push: !prev.notifications.push}
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      profileData.notifications.push 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {profileData.notifications.push ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                      <p className="text-sm text-gray-600">Receive product updates and promotions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileData(prev => ({
                      ...prev, 
                      notifications: {...prev.notifications, marketing: !prev.notifications.marketing}
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      profileData.notifications.marketing 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {profileData.notifications.marketing ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
            </button>
              </div>
            </div>
        </div>
        )}
      </div>
    </div>
  );
}