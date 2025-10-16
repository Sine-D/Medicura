import { createContext, useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
export const AdminContext = createContext()

// Axios response interceptor to handle JWT expiration globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message
    if (errorMessage && (errorMessage.includes('Session expired') || errorMessage.includes('expired'))) {
      // Clear token and redirect to login
      localStorage.removeItem('aToken')
      localStorage.removeItem('userInfo')
      // Show user-friendly message
      toast.error('Your session has expired. Please login again.')
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    }
    return Promise.reject(error)
  }
)

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(() => {
        return localStorage.getItem('aToken') || ''
    })

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
    const [doctors, setDoctors] = useState([])
    const [dashboardStats, setDashboardStats] = useState(null)
    const [recentActivities, setRecentActivities] = useState(null)

    const getAllDoctors = async () => {
        try{
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {},{headers:{atoken:aToken}})
            if(data.success){
                setDoctors(data.doctors)
                console.log(data.doctors)
            }else{
                toast.error(data.message)
                // If session expired, clear token and redirect to login
                if(data.message.includes('Session expired') || data.message.includes('expired')){
                    setAToken('')
                    localStorage.removeItem('aToken')
                }
            }

        }catch(error){
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            // If session expired, clear token and redirect to login
            if(errorMessage.includes('Session expired') || errorMessage.includes('expired')){
                setAToken('')
                localStorage.removeItem('aToken')
            }
        }
    }

    const loginAdmin = async () => {
        try{
            const email = import.meta.env.VITE_ADMIN_EMAIL
            const password = import.meta.env.VITE_ADMIN_PASSWORD
            if(!email || !password){
                console.warn('Admin auto-login skipped: missing VITE_ADMIN_EMAIL or VITE_ADMIN_PASSWORD')
                return null
            }
            const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
            if(data.success && data.token){
                value.setAToken(data.token)
                return data.token
            }else{
                toast.error(data.message || 'Admin login failed')
                return null
            }
        }catch(error){
            toast.error(error.message)
            return null
        }
    }

    const getDashboardStats = async () => {
        try{
            const {data} = await axios.get(backendUrl + '/api/admin/dashboard-stats', {headers:{atoken:aToken}})
            if(data.success){
                setDashboardStats(data.stats)
                setRecentActivities(data.recent)
                return data
            }else{
                toast.error(data.message)
                // If session expired, clear token and redirect to login
                if(data.message.includes('Session expired') || data.message.includes('expired')){
                    setAToken('')
                    localStorage.removeItem('aToken')
                }
                return null
            }
        }catch(error){
            // If unauthorized and auto-login is configured, try to login and retry once
            const msg = error?.response?.data?.message || error.message
            const shouldAuto = (import.meta.env.VITE_ADMIN_AUTO_LOGIN ?? 'true') !== 'false'
            if(shouldAuto && (!aToken || msg.toLowerCase().includes('not authorized') || msg.includes('Session expired'))){
                const token = await loginAdmin()
                if(token){
                    try{
                        const {data} = await axios.get(backendUrl + '/api/admin/dashboard-stats', {headers:{atoken: token}})
                        if(data.success){
                            setDashboardStats(data.stats)
                            setRecentActivities(data.recent)
                            return data
                        }
                    }catch{}
                }
            }
            // If session expired, clear token and redirect to login
            if(msg.includes('Session expired') || msg.includes('expired')){
                setAToken('')
                localStorage.removeItem('aToken')
            }
            toast.error(msg)
            return null
        }
    }

    // Sync token with localStorage and refresh dashboard on token changes
    useEffect(() => {
        const token = localStorage.getItem('aToken')
        if (token !== aToken) {
            setAToken(token || '')
        }
    }, [aToken])

    useEffect(() => {
        // auto-login on first load if enabled and no token
        const shouldAuto = (import.meta.env.VITE_ADMIN_AUTO_LOGIN ?? 'true') !== 'false'
        if(!aToken && shouldAuto){
            loginAdmin()
        }

        if (aToken) {
            getDashboardStats()
        } else {
            setDashboardStats(null)
            setRecentActivities(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aToken, backendUrl])

    const value = {
        aToken, 
        setAToken: (token) => {
            if (token) {
                localStorage.setItem('aToken', token)
            } else {
                localStorage.removeItem('aToken')
            }
            setAToken(token || '')
        },
        backendUrl,getAllDoctors,doctors,getDashboardStats,dashboardStats,recentActivities,loginAdmin
    }
    
    return (
        <AdminContext.Provider value={value}>
        {props.children}
        </AdminContext.Provider>
    )
}
    
    export default AdminContextProvider