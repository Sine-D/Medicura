import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import RelatedDoctors from '../components/RelatedDoctors'

export const Appointments = () => {

  const { docId } = useParams()
  const {doctors,currencySymbol, backendUrl, token} = useContext(AppContext)
  const navigate = useNavigate()
  const daysofWeek = ['MON','TUE','WED','THU','FRI','SAT','SUN']

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

    for(let i = 0 ; i < 7; i++){
      // getting date with index
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate()+i)

      // setting end time of the date with index
      let endTime = new Date(currentDate)
      endTime.setHours(21,0,0,0)

      // setting hours
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      while(currentDate < endTime){
        let formattedTime = currentDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})

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


  useEffect(()=>{
    getAvailableSlots()
    }, [])

  useEffect(() => {
    fetchDocInfo()
  },[doctors,docId])

  useEffect(()=>{
    console.log(docSlots);
  },[docSlots])


  if (!docInfo) {
    return <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Loading doctor information...</p>
    </div>
  }

  return (
    <div>
        {/*--------doctor details--------*/}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div>
            <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={(docInfo.image || '').toString().trim().startsWith('http') ? docInfo.image : ( (docInfo.image || '').toString().trim().startsWith('/uploads') || (docInfo.image || '').toString().trim().startsWith('uploads') ? `${backendUrl}${(docInfo.image || '').toString().trim().startsWith('/') ? '' : '/'}${(docInfo.image || '').toString().trim()}` : docInfo.image)} alt="" />
          </div>


          <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
            {/*--------doctor info--------*/}
            <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
              {docInfo.name}
              <img className='w-5' src={assets.verified_icon} alt="" />
            </p>
            <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
              <p>{docInfo.degree} - {docInfo.speciality}</p>
              <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
            </div>

            {/*--------doctor about--------*/}
            <div>
              <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>
                About<img src={assets.info_icon} alt="" />
              </p>
              <p className='text-sm text-gray-500 max-w-[700px] mt-1'>
                {docInfo.about}
              </p>
            </div>
              <p className='text-gray-500 font-medium mt-4'>
                Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
              </p>
          </div>
        </div>

        {/*--------------booking slots-----------*/}
        <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
          {bookingSuccess && (
            <div className='mb-6 p-6 rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white text-green-800 shadow-sm'>
              <div className='flex items-start gap-4'>
                <img src={assets.verified_icon} alt='' className='w-8 h-8 mt-1' />
                <div className='flex-1'>
                  <h3 className='text-xl font-semibold'>Appointment booked successfully</h3>
                  <p className='text-sm text-green-700 mt-1'>{bookingMessage || 'Your appointment has been booked. You can view details in My Appointments.'}</p>
                  <div className='flex flex-wrap gap-3 mt-4'>
                    <button onClick={()=> navigate('/MyAppointments')} className='px-4 py-2 rounded-full text-white bg-green-600 hover:bg-green-700 transition'>
                      View My Appointments
                    </button>
                    <button onClick={()=> navigate('/')} className='px-4 py-2 rounded-full border border-green-300 text-green-800 hover:bg-green-100 transition'>
                      Go to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <p>Booking slots</p>
          <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length && docSlots.map((item,index)=>(
            <div onClick={()=> setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white':'border border-gray-200'}`}key={index}>
              <p>{item[0] && daysofWeek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
            ))
          }
          </div>
            <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
              {docSlots.length && docSlots[slotIndex].map((item,index)=>(
                <p onClick={()=>setSlotTime(item.time)} className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white':'text-gray-400 border border-gray-300'}`} key={index}>
                  {item.time.toLowerCase()}
                </p>
              ))}
            </div>
              <button onClick={async()=>{
                if(!token){ toast.error('Please login to book'); navigate('/Login'); return }
                if(!slotTime){ toast.error('Please select a time'); return }
                if(!docInfo){ toast.error('Invalid doctor'); return }
                try{
                  setIsBooking(true)
                  const dateObj = docSlots?.[slotIndex]?.[0]?.datetime
                  if(!dateObj){ toast.error('Please select a day'); return }
                  const payload = { doctorId: docInfo._id, date: dateObj?.toISOString(), slot: slotTime, doctorName: docInfo.name, speciality: docInfo.speciality, fees: docInfo.fees }
                  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
                  console.log('Booking payload:', payload, 'backendUrl:', backendUrl)
                  const res = await axios.post(backendUrl + '/api/user/appointments', payload, { headers, timeout: 10000 })
                  const data = res?.data
                  if(data?.success){
                    toast.success('Appointment booked')
                    setBookingMessage(`Your appointment with ${docInfo.name} at ${slotTime.toLowerCase()} has been booked. You can view it in My Appointments.`)
                    setBookingSuccess(true)
                  }
                  else{ toast.error(data?.message || 'Booking failed') }
                }catch(err){
                  const msg = err?.response?.data?.message || err.message
                  toast.error(msg)
                } finally {
                  setIsBooking(false)
                }
              }} className='bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6'>
                {isBooking ? 'Booking…' : 'Book an appointment'}
              </button>
        </div>

        {/*-----listing related doctors--------*/}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality}/>

    </div>
  )
}

export default Appointments