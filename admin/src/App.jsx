import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Admin/Dashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import LabAssistantDashboard from './pages/LabAssistantDashboard'
import InventoryManagerDashboard from './pages/InventoryManagerDashboard'
import BuyPage from './pages/BuyPage'
import BillingDashboard from './pages/BillingDashboard'
import ContactSuccessPage from './pages/ContactSuccessPage'
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'
import EmployeePaymentPage from './pages/EmployeePaymentPage'
import PaymentAnalysisPage from './pages/PaymentAnalysisPage'
import PayExpensePage from './pages/PayExpensePage'
import ContactPage from './pages/Contact'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AdminContext } from './context/AdminContext'
import Navbar from './components/Navbar'
import SideBar from './components/SideBar'
import AddDoctor from './pages/Admin/AddDoctor'
import Contacts from './pages/Admin/Contacts'
import Reports from './pages/Admin/Reports'

import InventoryManament from "./components/InventoryManament"
import Home from "./components/Home"
import MyCart from "./components/MyCart"
import SupplierDashboard from "./components/SupplierDashboard"
import InventoryReuqestManagement from "./components/InventoryReuqestManagement"
import CreateRequestInventory from "./components/CreateRequestInventory"
import InvoicesSentBySupplier from "./components/InvoicesSentBySupplier"
import InventoryDashboard from "./components/InventoryDashboard"
import "./dashboard.css"

import LabAssistant from './components/LabAssistant'
import AppointmentsPage from './components/AppointmentsPage'
import TestsPage from './components/TestsPage'


// 404 Not Found Component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </button>
    </div>
  </div>
)

const App = () => {
  const { aToken } = useContext(AdminContext)
  
  // Function to get user info and determine dashboard
  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}')
    } catch {
      return {}
    }
  }

  const getDashboardComponent = () => {
    const userInfo = getUserInfo()
    const userType = userInfo.userType

    switch (userType) {
      case 'admin':
        return <Dashboard />
      case 'doctor':
        return <DoctorDashboard />
      case 'labAssistant':
        return <LabAssistant />
      case 'supplier':
        return <SupplierDashboard />
      case 'inventoryManager':
        return <InventoryManagerDashboard />
      case 'accountant':
        return <BillingDashboard />
      default:
        return <Dashboard />
    }
  }
  
  // Check if user is admin
  const isAdmin = () => {
    const userInfo = getUserInfo()
    return userInfo.userType === 'admin'
  }

  return (
    <div className='min-h-screen bg-[#F8F9FD]'>
      <ToastContainer />
      {aToken && <Navbar />}
      {aToken ? (
        <div className='flex items-start'>
          {isAdmin() && <SideBar />}
          <div className={isAdmin() ? 'flex-1' : 'w-full'}>
            <Routes>
              {/* Dashboard Routes */}
              <Route path='/' element={getDashboardComponent()} />
              <Route path='/dashboard' element={getDashboardComponent()} />
              <Route path='/admin-dashboard' element={<Dashboard />} />
              
              {/* Admin Routes */}
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/contacts' element={<Contacts />} />
              <Route path='/reports' element={<Reports />} />
              
              {/* Contact Routes - MUST BE BEFORE CATCH-ALL */}
              <Route path='/contact' element={<ContactPage />} />
              <Route path='/contact-success' element={<ContactSuccessPage />} />
              
              {/* Billing and Payment Routes */}
              <Route path='/billing' element={<BuyPage />} />
              <Route path='/billing-dashboard' element={<BillingDashboard />} />
              <Route path='/success' element={<SuccessPage />} />
              <Route path='/cancel' element={<CancelPage />} />
              <Route path='/employee-payment' element={<EmployeePaymentPage />} />
              <Route path='/payment-analysis' element={<PaymentAnalysisPage />} />
              <Route path='/pay-expense' element={<PayExpensePage />} />

              {/* Inventory Routes */}
              <Route path='/request-management' element={<InventoryReuqestManagement />} />
              <Route path='/inventory-item-management' element={<InvoicesSentBySupplier />} />
              <Route path='/create-request' element={<CreateRequestInventory />} />
              <Route path='/inventory-management' element={<InventoryManament />} />
              <Route path='/supplier-dashboard' element={<SupplierDashboard />} />
              <Route path='/inventory-dashboard' element={<InventoryDashboard />} />
              <Route path="/lab" element={<LabAssistant />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/tests" element={<TestsPage />} />
              
              {/* Catch-all 404 - MUST BE LAST */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      )}
    </div>
  )
}

export default App