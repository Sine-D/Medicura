import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { assets } from '../assets/assets'

const Doctors = () => {

  const { speciality } = useParams()
  const navigate  = useNavigate()
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

  useEffect(()=>{
    applyFilter()
  }, [doctorList, normalizedSpeciality])

  // Always fetch latest doctors from backend on mount; fallback to context on error
  useEffect(() => {
    const fetchLatestDoctors = async () => {
      try{
        const res = await axios.get(backendUrl + '/api/doctors')
        const data = res?.data
        if(data?.success && Array.isArray(data.doctors)){
          setPageDoctors(data.doctors)
          return
        }
        setPageDoctors(Array.isArray(doctors) ? doctors : [])
      }catch{
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
    try{
      const res = await axios.get(backendUrl + '/api/doctors')
      const data = res?.data
      if(data?.success && Array.isArray(data.doctors)){
        setPageDoctors(data.doctors)
      }
    }catch{}
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
    <div>
      <p className='text-gray-600'>Browse through the doctors specialist.</p>
      <div className='flex flex-col sm:flex-row items-start gap-5 mt-5'>
        <div className='flex flex-col gap-4 text-sm text-gray-600'>
          <p onClick={()=> normalizedSpeciality === 'general physician' ? navigate('/Doctors') : navigate('/Doctors/General-physician') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'general physician' ? 'bg-indigo-100 text-black' : ''}`}>General Physician</p>
          <p onClick={()=> normalizedSpeciality === 'gynecologist' ? navigate('/Doctors') : navigate('/Doctors/Gynecologist') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'gynecologist' ? 'bg-indigo-100 text-black' : ''}`}>Gynecologist</p>
          <p onClick={()=> normalizedSpeciality === 'dermatologist' ? navigate('/Doctors') : navigate('/Doctors/Dermatologist') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'dermatologist' ? 'bg-indigo-100 text-black' : ''}`}>Dermatologist</p>
          <p onClick={()=> normalizedSpeciality === 'pediatricians' ? navigate('/Doctors') : navigate('/Doctors/Pediatricians') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'pediatricians' ? 'bg-indigo-100 text-black' : ''}`}>Pediatricians</p>
          <p onClick={()=> normalizedSpeciality === 'neurologist' ? navigate('/Doctors') : navigate('/Doctors/Neurologist') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'neurologist' ? 'bg-indigo-100 text-black' : ''}`}>Neurologist</p>
          <p onClick={()=> normalizedSpeciality === 'gastroenterologist' ? navigate('/Doctors') : navigate('/Doctors/Gastroenterologist') } className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${normalizedSpeciality === 'gastroenterologist' ? 'bg-indigo-100 text-black' : ''}`}>Gastroenterologist</p>        
        </div>

        <div className='w-full grid grid-cols-auto gap-4 gap-y-6'>
          {
            filterDoc.map((item,index)=>(
              <div onClick={() => navigate(`/appointments/${item._id}`)}  className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' key={item._id || index}>
                  <img className='bg-blue-50' src={resolveImage(item.image)} alt={item.name} />
              <div className='p-4'>
              <div className='flex items-center gap-2 text-sm text-center text-green-500'>
                  <p className='w-2 h-2 bg-green-500 rounded-full'></p><p>Available</p>
              </div>
                  <p className='text-gray-900 text-lg font-medium'>{item.name}</p>
                  <p className='text-gray-600 text-sm'>{item.speciality}</p>
              </div>
          </div>
          ))
          }
        </div>
        <div className='w-full sm:w-auto mt-4 sm:mt-0'>
          <button onClick={handleManualRefresh} className='px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100'>Refresh</button>
        </div>
      </div>
    </div>
  )
}

export default Doctors
