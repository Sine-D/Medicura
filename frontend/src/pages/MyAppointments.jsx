import React, {useContext, useEffect, useMemo, useState} from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const MyAppointments = () => {
  const { backendUrl, token, doctors, currencySymbol } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmAppt, setConfirmAppt] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [payingId, setPayingId] = useState('')
  const [payModalAppt, setPayModalAppt] = useState(null)

  const fetchAppointments = async () => {
    try{
      setIsLoading(true)
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers })
      if(data.success) setAppointments(data.appointments)
      else toast.error(data.message)
    }catch(err){ toast.error(err.message) }
    finally{ setIsLoading(false) }
  }

  const cancelAppointment = async (id) => {
    try{
      setIsCancelling(true)
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.delete(backendUrl + `/api/user/appointments/${id}`, { headers })
      if(data.success){ toast.success('Appointment cancelled'); setConfirmAppt(null); fetchAppointments() }
      else toast.error(data.message)
    }catch(err){ toast.error(err.message) }
    finally{ setIsCancelling(false) }
  }

  useEffect(()=>{ fetchAppointments() },[])

  const statusStyleByValue = useMemo(()=>({
    scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  }), [])

  const handlePayOnline = async (ap) => {
    try{
      setPayingId(ap._id)
      const orderData = {
        order_id: `APPT-${ap._id}-${Date.now()}`,
        items: `Consultation with ${ap.doctorName || 'Doctor'}`,
        currency: 'USD',
        amount: (typeof ap.fees === 'number' ? ap.fees : 1000).toFixed(2),
        first_name: 'Patient',
        last_name: 'User',
        email: 'patient@example.com',
        phone: '0700000000',
        address: 'Address',
        city: 'City',
        country: 'Sri Lanka'
      }

      console.log('Creating PayHere order with', orderData)
      const res = await fetch(`${backendUrl}/api/payhere/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      if(!res.ok){
        const txt = await res.text()
        console.error('Payment server error', txt)
        toast.error('Payment server error')
        return
      }
      const data = await res.json()
      console.log('PayHere payload', data)

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://sandbox.payhere.lk/pay/checkout'
      Object.keys(data).forEach(key => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = data[key]
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    }catch(err){
      console.error(err)
      toast.error(err.message)
    }finally{
      setPayingId('')
    }
  }

  // ===== Exports =====
  const toCsv = (rows) => {
    const header = ['Date','Time','Doctor','Speciality','Status','Reference','Amount']
    const csvRows = [header.join(',')]
    rows.forEach(ap => {
      const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
      const doctor = docMeta?.name || ap.doctorName || 'Doctor'
      const spec = docMeta?.speciality || ap.speciality || ''
      const dateObj = new Date(ap.date)
      const dateStr = dateObj.toLocaleDateString()
      const time = ap.slot
      const status = ap.status
      const ref = ap._id?.slice?.(-6) || ''
      const amount = typeof ap.fees === 'number' ? ap.fees : ''
      csvRows.push([dateStr,time,doctor,spec,status,ref,amount].map(x => `"${(x ?? '').toString().replace(/"/g,'""')}"`).join(','))
    })
    return csvRows.join('\n')
  }

  const downloadCsvAll = () => {
    if(appointments.length === 0){ toast.info('No appointments to export'); return }
    const csv = toCsv(appointments)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Dynamically load jsPDF from CDN when needed
  const ensureJsPDF = () => new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF)
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF)
      else reject(new Error('Failed to load jsPDF'))
    }
    script.onerror = () => reject(new Error('Failed to load jsPDF'))
    document.body.appendChild(script)
  })

  const downloadPdfAll = async () => {
    try{
      if(appointments.length === 0){ toast.info('No appointments to export'); return }
      const jsPDF = await ensureJsPDF()
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const margin = 40
      const lineHeight = 18
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let y = margin

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('Appointments Export', margin, y)
      y += lineHeight

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const header = ['Date','Time','Doctor','Speciality','Status','Ref','Amount']
      const colWidths = [70, 50, 140, 100, 70, 50, 60]

      // Draw header
      let x = margin
      header.forEach((h, i) => {
        doc.text(h, x, y)
        x += colWidths[i]
      })
      y += lineHeight

      // Rows
      const rows = appointments.map(ap => {
        const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
        const doctor = docMeta?.name || ap.doctorName || 'Doctor'
        const spec = docMeta?.speciality || ap.speciality || ''
        return [
          new Date(ap.date).toLocaleDateString(),
          ap.slot || '',
          doctor,
          spec,
          ap.status || '',
          ap._id?.slice?.(-6) || '',
          typeof ap.fees === 'number' ? `${currencySymbol}${ap.fees}` : ''
        ]
      })

      rows.forEach(row => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        let cx = margin
        row.forEach((cell, i) => {
          const text = String(cell)
          const maxWidth = colWidths[i] - 4
          const wrapped = doc.splitTextToSize(text, maxWidth)
          wrapped.forEach((line, idx) => {
            if (y > pageHeight - margin) { doc.addPage(); y = margin }
            doc.text(line, cx, y + idx * 12)
          })
          const linesUsed = wrapped.length
          const rowHeight = Math.max(lineHeight, linesUsed * 12)
          cx += colWidths[i]
          // update y after last column
          if (i === row.length - 1) y += rowHeight
        })
      })

      doc.save(`appointments_${new Date().toISOString().slice(0,10)}.pdf`)
    }catch(err){
      console.error(err)
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  const printSingleReceipt = (ap) => {
    const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
    const doctor = docMeta?.name || ap.doctorName || 'Doctor'
    const spec = docMeta?.speciality || ap.speciality || ''
    const html = `
      <div class="brand">
        <img src="${assets?.admin_logo || ''}" alt=""/>
        <div>
          <div style="font-weight:700">MediCura</div>
          <div style="font-size:12px;color:#555">Appointment Receipt</div>
        </div>
      </div>
      <h1>Receipt #${ap._id?.slice?.(-8) || ''}</h1>
      <table><tbody>
        <tr><th>Date</th><td>${new Date(ap.date).toLocaleDateString()}</td></tr>
        <tr><th>Time</th><td>${ap.slot}</td></tr>
        <tr><th>Doctor</th><td>${doctor} (${spec})</td></tr>
        <tr><th>Status</th><td>${ap.status}</td></tr>
        <tr><th>Amount</th><td>${typeof ap.fees === 'number' ? `${currencySymbol}${ap.fees}` : '-'}</td></tr>
      </tbody></table>
      <div class="footer">Thank you for choosing MediCura.</div>
    `
    const win = window.open('', '_blank')
    if(!win) { toast.error('Pop-up blocked. Please allow pop-ups.'); return }
    win.document.open()
    win.document.write(`<!doctype html><html><head><title>Receipt</title></head><body>${html}</body></html>`)
    win.document.close(); win.focus(); win.print()
  }

  return (
    <div>
      <div className='mt-12'>
        <h2 className='text-xl sm:text-2xl font-semibold text-zinc-800'>My appointments</h2>
        <p className='text-sm text-zinc-500 mt-1'>Manage and review your upcoming and past bookings</p>
        {!isLoading && appointments.length > 0 && (
          <div className='mt-3 flex gap-2'>
            <button onClick={downloadPdfAll} className='px-3 py-1.5 rounded-full border bg-green-300 border-gray-600 text-sm hover:bg-zinc-50'>Download PDF</button>
            <button onClick={downloadCsvAll} className='px-3 py-1.5 rounded-full border bg-green-300 border-gray-600 text-sm hover:bg-zinc-50'>Download CSV</button>
          </div>
        )}
      </div>

      {/* Loading and content unchanged below */}
      {isLoading && (
        <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='rounded-2xl border border-zinc-200 p-4 animate-pulse bg-white'>
              <div className='h-6 w-32 bg-zinc-200 rounded mb-3'></div>
              <div className='h-4 w-24 bg-zinc-200 rounded mb-2'></div>
              <div className='h-4 w-20 bg-zinc-200 rounded mb-4'></div>
              <div className='h-9 w-full bg-zinc-200 rounded'></div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && appointments.length === 0 && (
        <div className='mt-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center'>
          <div className='flex justify-center'>
            <img src={assets.appointment_img} alt='' className='w-44 h-28 object-contain opacity-90' />
          </div>
          <h3 className='mt-4 text-lg font-semibold text-zinc-800'>No appointments yet</h3>
          <p className='mt-1 text-sm text-zinc-500'>When you book an appointment, it will appear here.</p>
          <div className='mt-4'>
            <a href='/' className='inline-block px-5 py-2 rounded-full bg-primary text-white hover:opacity-90 transition'>Book your first appointment</a>
          </div>
        </div>
      )}

      {!isLoading && appointments.length > 0 && (
        <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {appointments.map(ap => {
            const dateObj = new Date(ap.date)
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            const badgeClass = statusStyleByValue[ap.status?.toLowerCase?.()] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
            const isCancelled = ap.status?.toLowerCase?.() === 'cancelled'
            const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
            const doctorName = docMeta?.name || ap.doctorName || 'Doctor'
            const doctorSpeciality = docMeta?.speciality || ap.speciality || ''
            return (
              <div key={ap._id} className='rounded-2xl border border-zinc-200 bg-white p-5 hover:shadow-md transition-shadow'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-base font-semibold text-zinc-800'>{dateStr}</p>
                    <p className='text-sm text-zinc-500 mt-0.5'>{ap.slot}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border capitalize ${badgeClass}`}>{ap.status}</span>
                </div>
                <div className='mt-4 flex items-center gap-3'>
                  <img src={docMeta?.image || assets.profile_pic} alt='' className='w-12 h-12 rounded-full object-cover border border-zinc-200' />
                  <div className='text-sm text-zinc-600'>
                    <p className='text-zinc-800 font-medium'>{doctorName}</p>
                    <p className='text-xs capitalize'>{doctorSpeciality}</p>
                    <p className='text-xs'>Ref: {ap._id?.slice?.(-6) || '—'} {ap.fees ? `• ${currencySymbol}${ap.fees}` : ''}</p>
                  </div>
                </div>
                <div className='mt-5 flex gap-3'>
                  <button
                    onClick={()=> setConfirmAppt(ap)}
                    disabled={isCancelled}
                    className={`flex-1 text-sm text-center px-4 py-2 rounded-full border transition ${isCancelled ? 'text-zinc-400 border-zinc-200 cursor-not-allowed' : 'text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white'}`}
                  >
                    Cancel appointment
                  </button>
                  <button
                    onClick={()=> setPayModalAppt(ap)}
                    disabled={isCancelled || payingId === ap._id}
                    className={`px-4 py-2 rounded-full text-sm border transition ${isCancelled ? 'text-zinc-400 border-zinc-200 cursor-not-allowed' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white'}`}
                  >
                    {payingId === ap._id ? 'Redirecting…' : 'Pay via online'}
                  </button>
                
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmAppt && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/30'></div>
          <div className='relative z-10 w-[92%] max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100'>
                <span className='text-rose-600 text-lg'>!</span>
              </div>
              <div className='flex-1'>
                <h3 className='text-lg font-semibold text-zinc-900'>Cancel this appointment?</h3>
                <p className='text-sm text-zinc-600 mt-1'>
                  {`You are about to cancel the appointment on ${new Date(confirmAppt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${confirmAppt.slot}.`}
                </p>
              </div>
            </div>
            <div className='mt-5 flex gap-3'>
              <button
                onClick={()=> setConfirmAppt(null)}
                className='flex-1 px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm'
              >
                Keep appointment
              </button>
              <button
                onClick={()=> cancelAppointment(confirmAppt._id)}
                disabled={isCancelling}
                className={`flex-1 px-4 py-2 rounded-full text-white text-sm ${isCancelling ? 'bg-rose-400 cursor-wait' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {isCancelling ? 'Cancelling…' : 'Cancel appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {payModalAppt && (()=>{
        const ap = payModalAppt
        const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
        const doctorName = docMeta?.name || ap.doctorName || 'Doctor'
        const doctorSpeciality = docMeta?.speciality || ap.speciality || ''
        const amountNum = typeof ap.fees === 'number' ? ap.fees : 1000
        return (
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-[1px]'></div>
            <div className='relative z-10 w-[92%] max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold'>
                  $ 
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-zinc-900'>Confirm payment</h3>
                  <p className='text-xs text-zinc-600'>Secure checkout powered by PayHere Sandbox</p>
                </div>
              </div>
              <div className='mt-5 rounded-xl border border-zinc-200 p-4 bg-zinc-50'>
                <div className='flex items-center gap-3'>
                  <img src={docMeta?.image || assets.profile_pic} alt='' className='w-10 h-10 rounded-full object-cover border border-zinc-200' />
                  <div className='text-sm'>
                    <p className='text-zinc-800 font-medium'>{doctorName}</p>
                    <p className='text-xs text-zinc-600 capitalize'>{doctorSpeciality}</p>
                  </div>
                </div>
                <div className='mt-4 grid grid-cols-2 gap-y-2 text-sm'>
                  <span className='text-zinc-600'>Appointment</span>
                  <span className='text-zinc-800 text-right'>{new Date(ap.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}, {ap.slot}</span>
                  <span className='text-zinc-600'>Amount</span>
                  <span className='text-zinc-900 font-semibold text-right'>${amountNum.toFixed(2)} USD</span>
                </div>
              </div>
              <div className='mt-5 flex gap-3'>
                <button onClick={()=> setPayModalAppt(null)} className='flex-1 px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm'>Close</button>
                <button onClick={()=> handlePayOnline(ap)} disabled={payingId===ap._id} className={`flex-1 px-4 py-2 rounded-full text-white text-sm ${payingId===ap._id ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{payingId===ap._id?'Redirecting…':'Pay $'+amountNum.toFixed(2)}</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default MyAppointments
