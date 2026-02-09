import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { assets } from '../assets/assets'

const Doctors = () => {

  const { speciality } = useParams()
  const navigate = useNavigate()
  const [filterDoc, setFilterDoc] = useState([])

  const { doctors, backendUrl, refreshDoctors } = useContext(AppContext)
  const [pageDoctors, setPageDoctors] = useState(Array.isArray(doctors) ? doctors : [])
  const doctorList = Array.isArray(pageDoctors) ? pageDoctors : []

  const normalizedSpeciality = (speciality || '').replace(/-/g, ' ').toLowerCase()

  const applyFilter = () => {
    if (normalizedSpeciality) {
      setFilterDoc(
        doctorList.filter(doc => (doc.speciality || '').toLowerCase() === normalizedSpeciality)
      )
    } else {
      setFilterDoc(doctorList)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctorList, normalizedSpeciality])

  // Always fetch latest doctors from backend on mount; fallback to context on error
  useEffect(() => {
    const fetchLatestDoctors = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/doctors')
        const data = res?.data
        if (data?.success && Array.isArray(data.doctors)) {
          setPageDoctors(data.doctors)
          return
        }
        setPageDoctors(Array.isArray(doctors) ? doctors : [])
      } catch {
        setPageDoctors(Array.isArray(doctors) ? doctors : [])
      }
    }
    fetchLatestDoctors()
  }, [backendUrl])

  // Refresh when page/tab becomes visible or regains focus
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        await refreshDoctors()
        setPageDoctors(Array.isArray(doctors) ? doctors : [])
      }
    }
    const handleFocus = async () => {
      await refreshDoctors()
      setPageDoctors(Array.isArray(doctors) ? doctors : [])
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
  }, [refreshDoctors, doctors])

  const handleManualRefresh = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/doctors')
      const data = res?.data
      if (data?.success && Array.isArray(data.doctors)) {
        setPageDoctors(data.doctors)
      }
    } catch { }
  }

  const resolveImage = (raw) => {
    const img = (raw || '').toString().trim().replace(/\\/g, '/');
    if (!img) return assets.profile_pic
    if (img.startsWith('http://') || img.startsWith('https://')) return img
    if (img.startsWith('/uploads') || img.startsWith('uploads')) {
      const path = img.startsWith('/') ? img : `/${img}`
      return `${backendUrl}${path}`
    }
    return img
  }

  // Light polling to pick up newly added doctors
  useEffect(() => {
    const id = setInterval(() => { handleManualRefresh() }, 10000)
    return () => clearInterval(id)
  }, [backendUrl])

  return (
    <div className='py-12 px-4 max-w-7xl mx-auto'>
      <div className='mb-12'>
        <h2 className='text-3xl md:text-5xl font-black text-white uppercase tracking-tighter'>
          Specialist <span className='neon-text'>Nexus</span>
        </h2>
        <p className='text-gray-500 text-sm font-bold uppercase tracking-widest mt-3 max-w-2xl leading-relaxed'>
          Access hyper-specialized medical intelligence nodes within our decentralized clinic ecosystem.
        </p>
      </div>

      <div className='flex flex-col lg:flex-row items-start gap-10'>
        {/* Speciality Sidebar */}
        <div className='flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest min-w-[240px] w-full lg:w-auto'>
          {['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist'].map((spec) => (
            <div
              key={spec}
              onClick={() => normalizedSpeciality === spec.toLowerCase() ? navigate('/Doctors') : navigate(`/Doctors/${spec.replace(/ /g, '-')}`)}
              className={`pl-6 py-4 pr-12 glass-card cursor-pointer transition-all duration-300 border-l-4 group/spec
              ${normalizedSpeciality === spec.toLowerCase()
                  ? 'border-l-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-neon-glow'
                  : 'border-l-transparent hover:border-l-neon-purple hover:bg-white/5 text-gray-500 hover:text-white'}`}
            >
              <div className='flex items-center justify-between'>
                <span>{spec}</span>
                <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${normalizedSpeciality === spec.toLowerCase() ? 'bg-neon-cyan shadow-neon-glow scale-125' : 'bg-gray-800 group-hover/spec:bg-neon-purple'}`}></span>
              </div>
            </div>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className='flex-1'>
          {filterDoc.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
              {filterDoc.map((item, index) => (
                <div
                  onClick={() => navigate(`/appointments/${item._id}`)}
                  className='glass-card overflow-hidden cursor-pointer group/card hover:border-white/20 transition-all duration-500'
                  key={item._id || index}
                >
                  <div className='relative overflow-hidden aspect-[3/4] bg-cyber-dark'>
                    <div className='absolute inset-0 z-10 bg-gradient-to-t from-cyber-black via-cyber-black/20 to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity'></div>
                    <img
                      className='w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110'
                      src={resolveImage(item.image)}
                      alt={item.name}
                    />
                    <div className='absolute top-4 right-4 z-20'>
                      <span className='px-3 py-1 glass-card bg-cyber-black/50 border-white/10 text-[8px] font-black text-neon-cyan uppercase tracking-widest'>Active Node</span>
                    </div>
                  </div>

                  <div className='p-6 relative z-10'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='w-2 h-2 bg-neon-cyan rounded-full shadow-neon-glow animate-pulse'></div>
                      <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Sector Status: Optimal</span>
                    </div>
                    <h3 className='text-xl font-black text-white uppercase tracking-tighter group-hover/card:text-neon-cyan transition-colors'>{item.name}</h3>
                    <p className='text-neon-purple text-[10px] font-black uppercase tracking-widest mt-1'>{item.speciality}</p>

                    <div className='mt-6 pt-6 border-t border-white/5 flex items-center justify-between'>
                      <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Initial Auth: $100</span>
                      <div className='w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover/card:border-neon-cyan group-hover/card:text-neon-cyan transition-colors'>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='glass-card border-white/5 py-32 px-10 text-center relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent'></div>
              <div className='relative z-10'>
                <div className='w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10'>
                  <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className='text-2xl font-black text-white uppercase tracking-tighter mb-2'>Sector Offline</h3>
                <p className='text-gray-500 text-sm font-medium'>No medical processing units are currently active in this specialized sector.</p>
                <button onClick={() => navigate('/Doctors')} className='neon-button px-8 py-3 mt-10 text-[10px]'>Return to Full Nexus</button>
              </div>
            </div>
          )}

          <div className='mt-16 pt-8 border-t border-white/5 flex flex-col items-center'>
            <p className='text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 animate-pulse'>Synching Global Specialist Network</p>
            <button
              onClick={handleManualRefresh}
              className='glass-card px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:text-neon-cyan hover:border-neon-cyan/30 flex items-center gap-3 transition-all'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Recalibrate Network
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Doctors
