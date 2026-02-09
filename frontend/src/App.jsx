import React, { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./pages/MyProfile";
import MyAppointments from "./pages/MyAppointments";
import Appointments from "./pages/Appointments";
import Laboratory from "./pages/Laboratory";
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'


import InventoryManament from "./components/InventoryManament";
import EPharmacy from "./components/E-Pharmacy";
import SupplierDashboard from "./components/SupplierDashboard";
import InventoryReuqestManagement from "./components/InventoryReuqestManagement";
import CreateRequestInventory from "./components/CreateRequestInventory";
import InvoicesSentBySupplier from "./components/InvoicesSentBySupplier";
import InventoryDashboard from "./components/InventoryDashboard";
import "./dashboard.css";

import AILabAssistant from "./pages/AILabAssistant";


// Lazy-loaded pages to avoid bundling unused heavy pages until route visit
const Epharmacy = lazy(() => import('./components/E-Pharmacy'))
const MyCart = lazy(() => import('./components/MyCart'))

// Scroll to top on route changes
const ScrollToTop = () => {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])
  return null
}

const App = () => {
  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className='min-h-screen bg-transparent'>
        <Navbar />
        <main className='mx-4 sm:mx-[10%] py-8'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/Doctors' element={<Doctors />} />
            <Route path='/Doctors/:speciality' element={<Doctors />} />
            <Route path='/Login' element={<Login />} />
            <Route path='/About' element={<About />} />
            <Route path='/Contact' element={<Contact />} />
            <Route path='/MyProfile' element={<MyProfile />} />
            <Route path='/MyAppointments' element={<MyAppointments />} />
            <Route path='/appointments/:docId' element={<Appointments />} />
            <Route path='/Laborotory' element={<Laboratory />} />
            <Route path='/ai-lab-assistant' element={<AILabAssistant />} />
            <Route path='/success' element={<SuccessPage />} />
            <Route path='/cancel' element={<CancelPage />} />
            <Route path='/E-Pharmacy' element={
              <Suspense fallback={<div className="text-neon-cyan animate-pulse">Loading...</div>}>
                <Epharmacy />
              </Suspense>
            } />
            <Route path='/my-cart' element={
              <Suspense fallback={<div className="text-neon-cyan animate-pulse">Loading...</div>}>
                <MyCart />
              </Suspense>
            } />


            <Route element={<EPharmacy />} path="/E-Pharmacy" />

            <Route
              element={<InventoryReuqestManagement />}
              path="/request-management"
            />
            <Route
              element={<InvoicesSentBySupplier />}
              path="/inventory-item-management"
            />
            <Route element={<CreateRequestInventory />} path="/create-request" />
            <Route element={<InventoryManament />} path="/inventory-management" />
            <Route element={<SupplierDashboard />} path="/supplier-dashboard" />
            <Route element={<InventoryDashboard />} path="/inventory-dashboard" />


          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App