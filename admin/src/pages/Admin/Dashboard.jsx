import React, { useEffect, useContext, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import axios from 'axios'
import EditDoctorModal from '../../components/EditDoctorModal'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const { getDashboardStats, dashboardStats, recentActivities, backendUrl, aToken } = useContext(AdminContext)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [specialityFilter, setSpecialityFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // initial load
    getDashboardStats()

    // poll every 10s for near real-time updates
    const intervalId = setInterval(() => {
      getDashboardStats()
    }, 10000)

    // refresh when window gains focus
    const onFocus = () => getDashboardStats()
    window.addEventListener('focus', onFocus)

    // refresh when tab becomes visible again
    const onVisibility = () => {
      if (!document.hidden) getDashboardStats()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const fetchDoctors = async () => {
    try{
      setLoading(true)
      const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { atoken: aToken } })
      if(data?.success){ setDoctors(data.doctors || []) }
    }catch{} finally{ setLoading(false) }
  }

  useEffect(() => { fetchDoctors() }, [])

  const deleteDoctor = async (id) => {
    if(!confirm('Delete this doctor?')) return
    try{
      const { data } = await axios.delete(`${backendUrl}/api/admin/doctor/${id}`, { headers: { atoken: aToken } })
      if(data?.success){ setDoctors(prev => prev.filter(d => d._id !== id)) }
    }catch{}
  }

  const uniqueSpecialities = ['All', ...Array.from(new Set(doctors.map(d => d.speciality).filter(Boolean)))]
  const filtered = doctors.filter(d => {
    const matchesQuery = (d.name?.toLowerCase().includes(query.toLowerCase()) || d.email?.toLowerCase().includes(query.toLowerCase()))
    const matchesSpec = specialityFilter === 'All' || d.speciality === specialityFilter
    return matchesQuery && matchesSpec
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = filtered.slice((page-1)*pageSize, (page-1)*pageSize + pageSize)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const StatCard = ({ icon, label, value, ringClass }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${ringClass}`}>{icon}</div>
      </div>
    </div>
  )

  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )

  if (!dashboardStats) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <img src={assets.home_icon} alt="Dashboard" className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        </div>
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_,i)=> (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full mt-2" />
          <Skeleton className="h-8 w-full mt-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img src={assets.home_icon} alt="Dashboard" className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<img src={assets.people_icon} alt="Users" className="w-6 h-6" />} label="Total Users" value={dashboardStats.totalUsers} ringClass="bg-blue-100" />
        <StatCard icon={<img src={assets.doctor_icon} alt="Doctors" className="w-6 h-6" />} label="Total Doctors" value={dashboardStats.totalDoctors} ringClass="bg-green-100" />
        <StatCard icon={<img src={assets.appointment_icon} alt="Appointments" className="w-6 h-6" />} label="Today's Appointments" value={dashboardStats.todayAppointments} ringClass="bg-purple-100" />
        <StatCard icon={<img src={assets.earning_icon} alt="Revenue" className="w-6 h-6" />} label="Total Revenue" value={formatCurrency(dashboardStats.totalRevenue)} ringClass="bg-yellow-100" />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<img src={assets.appointments_icon} alt="Monthly" className="w-6 h-6" />} label="This Month" value={`${dashboardStats.thisMonthAppointments} Appointments`} ringClass="bg-indigo-100" />
        <StatCard icon={<img src={assets.list_icon} alt="Messages" className="w-6 h-6" />} label="Pending Messages" value={dashboardStats.pendingContacts} ringClass="bg-red-100" />
        <StatCard icon={<img src={assets.appointments_icon} alt="Total" className="w-6 h-6" />} label="Total Appointments" value={dashboardStats.totalAppointments} ringClass="bg-teal-100" />
      </div>

      {/* Doctors Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Doctors</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <input value={query} onChange={(e)=>{ setPage(1); setQuery(e.target.value) }} placeholder="Search by name or email" className="pl-9 pr-3 py-1.5 rounded-full border text-sm w-64 focus:outline-none focus:border-primary"/>
              <span className="absolute left-3 top-1.5 text-gray-400" aria-hidden>🔍</span>
            </div>
            <select value={specialityFilter} onChange={(e)=>{ setPage(1); setSpecialityFilter(e.target.value) }} className="px-3 py-1.5 rounded-full border text-sm focus:outline-none focus:border-primary">
              {uniqueSpecialities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={fetchDoctors} className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-50">Refresh</button>
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_,i)=>(<Skeleton key={i} className="h-8 w-full" />))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500 text-sm">No doctors found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-gray-500">
                    <th className="py-2">Name</th>
                    <th className="py-2">Speciality</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Fees</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {current.map(doc => (
                    <tr key={doc._id} className="border-t hover:bg-gray-50">
                      <td className="py-2 flex items-center gap-3">
                        <img src={doc.image} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200" />
                        <div>
                          <p className="font-medium text-gray-800 leading-5">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.degree} • {doc.experience}</p>
                        </div>
                      </td>
                      <td className="py-2">{doc.speciality}</td>
                      <td className="py-2">{doc.email}</td>
                      <td className="py-2">{doc.fees}</td>
                      <td className="py-2 space-x-2">
                        <button onClick={()=> setEditingDoctor(doc)} className="px-2 py-1 border rounded hover:bg-gray-100">Edit</button>
                        <button onClick={()=> deleteDoctor(doc._id)} className="px-2 py-1 border rounded text-red-600 hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <p>Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, filtered.length)} of {filtered.length}</p>
              <div className="space-x-2">
                <button disabled={page<=1} onClick={()=> setPage(p=> Math.max(1, p-1))} className={`px-3 py-1 rounded-full border ${page<=1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Prev</button>
                <button disabled={page>=totalPages} onClick={()=> setPage(p=> Math.min(totalPages, p+1))} className={`px-3 py-1 rounded-full border ${page>=totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Doctor Modal */}
      <EditDoctorModal
        open={!!editingDoctor}
        doctor={editingDoctor}
        submitting={saving}
        onClose={() => setEditingDoctor(null)}
        onSubmit={async (formData) => {
          if (!editingDoctor) return
          try {
            setSaving(true)
            const { data } = await axios.put(`${backendUrl}/api/admin/doctor/${editingDoctor._id}`, formData, {
              headers: { atoken: aToken, 'Content-Type': 'multipart/form-data' }
            })
            if (data?.success) {
              setDoctors(prev => prev.map(d => d._id === editingDoctor._id ? data.doctor : d))
              setEditingDoctor(null)
              toast.success('Doctor updated')
            }
          } catch (err) {
            const msg = err?.response?.data?.message || err.message
            toast.error(msg)
          } finally {
            setSaving(false)
          }
        }}
      />

      {/* Recent Activities */}
      {recentActivities && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentActivities.users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h3>
            <div className="space-y-3">
              {recentActivities.appointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.doctorName}</p>
                    <p className="text-sm text-gray-600">{appointment.speciality}</p>
                    <p className="text-xs text-gray-500">{formatDate(appointment.date)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Contact Messages */}
      {recentActivities && recentActivities.contacts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Contact Messages</h3>
          <div className="space-y-3">
            {recentActivities.contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.subject || 'No subject'}</p>
                  <p className="text-xs text-gray-500">{contact.message.substring(0, 50)}...</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    contact.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contact.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(contact.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard