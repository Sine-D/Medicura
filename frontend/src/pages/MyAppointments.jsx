import React, { useContext, useEffect, useMemo, useState } from 'react'
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
    try {
      setIsLoading(true)
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers })
      if (data.success) setAppointments(data.appointments)
      else toast.error(data.message)
    } catch (err) { toast.error(err.message) }
    finally { setIsLoading(false) }
  }

  const cancelAppointment = async (id) => {
    try {
      setIsCancelling(true)
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.delete(backendUrl + `/api/user/appointments/${id}`, { headers })
      if (data.success) { toast.success('Appointment cancelled'); setConfirmAppt(null); fetchAppointments() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.message) }
    finally { setIsCancelling(false) }
  }

  useEffect(() => { fetchAppointments() }, [])

  const statusStyleByValue = useMemo(() => ({
    scheduled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  }), [])

  const handlePayOnline = async (ap) => {
    try {
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
      if (!res.ok) {
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
    } catch (err) {
      console.error(err)
      toast.error(err.message)
    } finally {
      setPayingId('')
    }
  }

  // ===== Exports =====
  const toCsv = (rows) => {
    const header = ['Date', 'Time', 'Doctor', 'Speciality', 'Status', 'Reference', 'Amount']
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
      csvRows.push([dateStr, time, doctor, spec, status, ref, amount].map(x => `"${(x ?? '').toString().replace(/"/g, '""')}"`).join(','))
    })
    return csvRows.join('\n')
  }

  const downloadCsvAll = () => {
    if (appointments.length === 0) { toast.info('No appointments to export'); return }
    const csv = toCsv(appointments)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${new Date().toISOString().slice(0, 10)}.csv`
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
    try {
      if (appointments.length === 0) { toast.info('No appointments to export'); return }
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
      const header = ['Date', 'Time', 'Doctor', 'Speciality', 'Status', 'Ref', 'Amount']
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

      doc.save(`appointments_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
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
    if (!win) { toast.error('Pop-up blocked. Please allow pop-ups.'); return }
    win.document.open()
    win.document.write(`<!doctype html><html><head><title>Receipt</title></head><body>${html}</body></html>`)
    win.document.close(); win.focus(); win.print()
  }

  return (
    <div className='py-12 px-4 max-w-7xl mx-auto'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12'>
        <div>
          <h2 className='text-3xl md:text-4xl font-black text-white uppercase tracking-tighter'>
            Neural <span className='neon-text'>Log</span>
          </h2>
          <p className='text-gray-500 text-sm font-bold uppercase tracking-widest mt-2'>Scheduled Medical Synchronizations</p>
        </div>

        {!isLoading && appointments.length > 0 && (
          <div className='flex gap-4'>
            <button onClick={downloadPdfAll} className='glass-card px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-neon-cyan border-neon-cyan/20 hover:bg-neon-cyan/10 transition-all flex items-center gap-2'>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
              Export PDF
            </button>
            <button onClick={downloadCsvAll} className='glass-card px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-neon-purple border-neon-purple/20 hover:bg-neon-purple/10 transition-all flex items-center gap-2'>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='glass-card p-6 animate-pulse border-white/5'>
              <div className='h-8 w-40 bg-white/5 rounded-lg mb-4'></div>
              <div className='h-4 w-24 bg-white/5 rounded mb-2'></div>
              <div className='h-20 w-full bg-white/5 rounded-xl mt-6'></div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className='glass-card border-white/5 py-20 px-8 text-center relative overflow-hidden group/empty'>
          <div className='absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover/empty:opacity-100 transition-opacity duration-1000'></div>
          <div className='relative z-10'>
            <div className='w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover/empty:scale-110 transition-transform'>
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className='text-xl font-black text-white uppercase tracking-widest mb-2'>No Active Synchs</h3>
            <p className='text-gray-500 font-medium mb-8'>Initialize a new medical bridge to view schedule data.</p>
            <a href='/' className='neon-button px-8 py-3 text-sm'>Initiate Protocol</a>
          </div>
        </div>
      ) : (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {appointments.map(ap => {
            const dateObj = new Date(ap.date)
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            const isCancelled = ap.status?.toLowerCase?.() === 'cancelled'
            const isCompleted = ap.status?.toLowerCase?.() === 'completed'
            const docMeta = doctors?.find?.(d => d._id === ap.doctorId)

            return (
              <div key={ap._id} className={`glass-card p-6 border-white/5 hover:border-white/20 transition-all group/card ${isCancelled ? 'opacity-60 grayscale' : ''}`}>
                <div className='flex items-start justify-between gap-4 mb-6'>
                  <div>
                    <h4 className='text-lg font-black text-white uppercase tracking-tighter'>{dateStr}</h4>
                    <p className='text-neon-cyan text-xs font-bold tracking-widest uppercase mt-1'>{ap.slot}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${isCancelled ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                      isCompleted ? 'border-green-500/30 text-green-500 bg-green-500/5' :
                        'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5'
                    }`}>
                    {ap.status}
                  </span>
                </div>

                <div className='glass-card border-none bg-white/5 p-4 flex items-center gap-4 mb-6 group-hover/card:bg-white/10 transition-colors'>
                  <div className='relative'>
                    <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl blur opacity-30 group-hover/card:opacity-70 transition duration-500'></div>
                    <img src={docMeta?.image || assets.profile_pic} alt='' className='w-14 h-14 rounded-xl object-cover relative z-10 border border-white/10' />
                  </div>
                  <div>
                    <p className='text-white font-black text-sm uppercase tracking-tighter'>{docMeta?.name || ap.doctorName}</p>
                    <p className='text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5'>{docMeta?.speciality || ap.speciality}</p>
                    <p className='text-neon-purple text-[10px] font-bold mt-1'>ID: {ap._id?.slice?.(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className='flex gap-3'>
                  {!isCancelled && !isCompleted ? (
                    <>
                      <button
                        onClick={() => setConfirmAppt(ap)}
                        className='flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all'
                      >
                        Abort
                      </button>
                      <button
                        onClick={() => setPayModalAppt(ap)}
                        disabled={payingId === ap._id}
                        className='flex-1 py-2.5 rounded-xl bg-neon-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-neon-glow transition-all disabled:opacity-50'
                      >
                        {payingId === ap._id ? 'SYNCING...' : 'FINALIZE PAY'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => printSingleReceipt(ap)}
                      className='w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2'
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4" /></svg>
                      Acquire Receipt
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAppt && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
          <div className='absolute inset-0 bg-cyber-black/80 backdrop-blur-md transition-opacity'></div>
          <div className='relative z-10 w-full max-w-md glass-card p-8 border-red-500/30 overflow-hidden group/modal'>
            <div className='absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl'></div>
            <div className='text-center relative z-10'>
              <div className='w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20'>
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className='text-2xl font-black text-white uppercase tracking-tighter mb-2'>Abort Connection?</h3>
              <p className='text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed'>
                Requesting termination of medical link for {new Date(confirmAppt.date).toLocaleDateString()} at {confirmAppt.slot}.
              </p>

              <div className='flex gap-4 mt-10'>
                <button
                  onClick={() => setConfirmAppt(null)}
                  className='flex-1 py-3 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all'
                >
                  Maintain
                </button>
                <button
                  onClick={() => cancelAppointment(confirmAppt._id)}
                  disabled={isCancelling}
                  className='flex-1 py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50'
                >
                  {isCancelling ? 'SYNC_KILL...' : 'CONFIRM_ABORT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModalAppt && (() => {
        const ap = payModalAppt
        const docMeta = doctors?.find?.(d => d._id === ap.doctorId)
        const amountNum = typeof ap.fees === 'number' ? ap.fees : 1000
        return (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-cyber-black/80 backdrop-blur-md transition-opacity'></div>
            <div className='relative z-10 w-full max-w-lg glass-card p-10 border-neon-cyan/30 overflow-hidden'>
              <div className='absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl'></div>

              <div className='flex items-center gap-6 mb-10 relative z-10'>
                <div className='w-16 h-16 bg-neon-cyan/20 rounded-2xl flex items-center justify-center text-neon-cyan border border-neon-cyan/30 shadow-neon-glow/20'>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className='text-2xl font-black text-white uppercase tracking-tighter'>Credit Authorization</h3>
                  <p className='text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1'>Pulse Checkout • Verified Nexus</p>
                </div>
              </div>

              <div className='glass-card bg-cyber-dark/50 border-white/5 p-6 mb-8 relative z-10'>
                <div className='flex items-center gap-4 border-b border-white/5 pb-4 mb-4'>
                  <img src={docMeta?.image || assets.profile_pic} alt='' className='w-12 h-12 rounded-xl border border-white/10' />
                  <div>
                    <p className='text-white font-black text-sm uppercase tracking-tighter'>{docMeta?.name || ap.doctorName}</p>
                    <p className='text-neon-cyan text-[10px] font-black uppercase tracking-widest'>{docMeta?.speciality || ap.speciality}</p>
                  </div>
                </div>
                <div className='space-y-3 text-[10px] font-black uppercase tracking-widest'>
                  <div className='flex justify-between items-center text-gray-500'>
                    <span>Time Node</span>
                    <span className='text-gray-300'>{new Date(ap.date).toLocaleDateString()}, {ap.slot}</span>
                  </div>
                  <div className='flex justify-between items-center text-white pt-2 border-t border-white/5'>
                    <span>Total Authorization</span>
                    <span className='text-neon-purple text-lg tracking-tighter'>${amountNum.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className='flex gap-4 relative z-10'>
                <button onClick={() => setPayModalAppt(null)} className='flex-1 py-4 rounded-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all'>Decline</button>
                <button
                  onClick={() => handlePayOnline(ap)}
                  disabled={payingId === ap._id}
                  className='flex-1 py-4 rounded-xl bg-neon-cyan text-black text-[10px] font-black uppercase tracking-widest hover:shadow-neon-glow transition-all disabled:opacity-50'
                >
                  {payingId === ap._id ? 'SYNCING...' : 'AUTHORIZE_TRANSFER'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default MyAppointments
