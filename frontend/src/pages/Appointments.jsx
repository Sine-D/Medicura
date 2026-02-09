import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import RelatedDoctors from '../components/RelatedDoctors'

export const Appointments = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token } = useContext(AppContext)
  const navigate = useNavigate()
  const daysofWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const fetchDocInfo = async () => {
    const docInfo = doctors.find(doc => doc._id === docId)
    setDocInfo(docInfo)
    console.log(docInfo)
  }

  const getAvailableSlots = async () => {
    // getting current date
    let today = new Date()
    let allSlots = []

    for (let i = 0; i < 7; i++) {
      // getting date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // setting end time of the date with index
      let endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        // add slot to array
        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        })

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      allSlots.push(timeSlots)
    }

    setDocSlots(allSlots)
  }


  useEffect(() => {
    getAvailableSlots()
  }, [])

  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots])


  if (!docInfo) {
    return <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Loading doctor information...</p>
    </div>
  }

  return (
    <div className='py-12 px-4'>
      {/*--------doctor details--------*/}
      <div className='flex flex-col lg:flex-row gap-8 items-start'>
        <div className='relative group/avatar w-full lg:max-w-72'>
          <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-3xl blur opacity-30 group-hover/avatar:opacity-60 transition duration-500'></div>
          <img className='relative z-10 glass-card p-2 w-full rounded-2xl border-white/10 ring-1 ring-white/5' src={(docInfo.image || '').toString().trim().startsWith('http') ? docInfo.image : ((docInfo.image || '').toString().trim().startsWith('/uploads') || (docInfo.image || '').toString().trim().startsWith('uploads') ? `${backendUrl}${(docInfo.image || '').toString().trim().startsWith('/') ? '' : '/'}${(docInfo.image || '').toString().trim()}` : docInfo.image)} alt="Medical Specialist Node" />
        </div>

        <div className='flex-1 glass-card p-10 relative overflow-hidden group/details'>
          <div className='absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl group-hover/details:bg-neon-cyan/10 transition-colors duration-700'></div>
          {/*--------doctor info--------*/}
          <h1 className='flex items-center gap-3 text-3xl font-black text-white uppercase tracking-tighter'>
            {docInfo.name}
            <img className='w-6 drop-shadow-neon-glow' src={assets.verified_icon} alt="Verified Node" />
          </h1>
          <div className='flex items-center gap-3 text-sm mt-3'>
            <p className='text-neon-cyan font-bold tracking-widest uppercase'>{docInfo.degree} — {docInfo.speciality}</p>
            <span className='px-3 py-1 glass-card border-white/10 text-[10px] font-black text-white uppercase tracking-widest'>{docInfo.experience} EXP</span>
          </div>

          {/*--------doctor about--------*/}
          <div className='mt-8 pt-8 border-t border-white/5'>
            <h3 className='flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest mb-4'>
              <img className='w-3.5 opacity-50' src={assets.info_icon} alt="" /> Specialist Intelligence
            </h3>
            <p className='text-gray-400 text-sm leading-relaxed max-w-3xl font-medium'>
              {docInfo.about}
            </p>
          </div>

          <div className='mt-10 flex items-center justify-between'>
            <div className='flex flex-col'>
              <span className='text-[10px] font-black text-gray-600 uppercase tracking-widest'>Auth Credit Required</span>
              <p className='text-2xl font-black text-white mt-1'>
                {currencySymbol}<span className='neon-text'>{docInfo.fees}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/*--------------booking slots-----------*/}
      <div className='mt-12'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-10 h-1 rounded-full bg-neon-cyan shadow-neon-glow'></div>
          <h2 className='text-lg font-black text-white uppercase tracking-widest'>Temporal Nexus (Booking Slots)</h2>
        </div>

        {bookingSuccess && (
          <div className='mb-12 glass-card border-green-500/30 bg-green-500/5 p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500'>
            <div className='absolute -top-12 -right-12 w-32 h-32 bg-green-500/10 rounded-full blur-2xl'></div>
            <div className='flex items-start gap-6 relative z-10'>
              <div className='w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/30 text-green-400 shadow-neon-glow/20'>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className='flex-1'>
                <h3 className='text-2xl font-black text-white uppercase tracking-tighter'>Synch Initialized</h3>
                <p className='text-gray-400 text-sm font-medium mt-1 leading-relaxed'>{bookingMessage}</p>
                <div className='flex flex-wrap gap-4 mt-6'>
                  <button onClick={() => navigate('/MyAppointments')} className='neon-button px-6 py-2.5 text-[10px]'>Access My Schedule</button>
                  <button onClick={() => navigate('/')} className='px-6 py-2.5 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all'>Return to Command</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='space-y-8'>
          <div className='flex gap-4 items-center w-full overflow-x-auto pb-4 scrollbar-hide'>
            {docSlots.length && docSlots.map((item, index) => (
              <div
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-20 rounded-2xl cursor-pointer transition-all duration-300 ${slotIndex === index
                    ? 'bg-neon-cyan text-black shadow-neon-glow font-black border-transparent'
                    : 'glass-card border-white/5 text-gray-500 hover:border-white/20'
                  }`}
              >
                <p className='text-[10px] uppercase font-black tracking-widest mb-1'>{item[0] && daysofWeek[item[0].datetime.getDay()]}</p>
                <p className='text-xl tracking-tighter'>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap gap-3 items-center w-full mt-4'>
            {docSlots.length && docSlots[slotIndex].map((item, index) => (
              <button
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${item.time === slotTime
                    ? 'bg-neon-purple text-white border-transparent shadow-neon-purple-glow'
                    : 'glass-card border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                  }`}
              >
                {item.time.toLowerCase()}
              </button>
            ))}
          </div>

          <button
            disabled={isBooking}
            onClick={async () => {
              if (!token) { toast.error('Please login to book'); navigate('/Login'); return }
              if (!slotTime) { toast.error('Please select a time'); return }
              if (!docInfo) { toast.error('Invalid doctor'); return }
              try {
                setIsBooking(true)
                const dateObj = docSlots?.[slotIndex]?.[0]?.datetime
                if (!dateObj) { toast.error('Please select a day'); return }
                const payload = { doctorId: docInfo._id, date: dateObj?.toISOString(), slot: slotTime, doctorName: docInfo.name, speciality: docInfo.speciality, fees: docInfo.fees }
                const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                const res = await axios.post(backendUrl + '/api/user/appointments', payload, { headers, timeout: 10000 })
                const data = res?.data
                if (data?.success) {
                  toast.success('Synch established')
                  setBookingMessage(`Medical bridge with ${docInfo.name} established for ${slotTime.toLowerCase()}. Session locked.`)
                  setBookingSuccess(true)
                }
                else { toast.error(data?.message || 'Synch failed') }
              } catch (err) {
                toast.error(err?.response?.data?.message || err.message)
              } finally {
                setIsBooking(false)
              }
            }}
            className='neon-button w-full lg:w-auto px-20 py-4 text-sm mt-8 disabled:opacity-50 disabled:cursor-not-allowed group/book'
          >
            {isBooking ? 'SYNCING DATA...' : 'ESTABLISH MEDICAL BRIDGE'}
          </button>
        </div>
      </div>

      {/*-----listing related doctors--------*/}
      <div className='mt-24 pt-12 border-t border-white/5'>
        <div className='flex items-center gap-3 mb-12'>
          <div className='w-10 h-1 rounded-full bg-neon-purple shadow-neon-purple-glow'></div>
          <h2 className='text-lg font-black text-white uppercase tracking-widest'>Similar Intelligence Units</h2>
        </div>
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>

    </div>
  )
}

export default Appointments