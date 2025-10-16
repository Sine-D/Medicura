import React, { useEffect, useMemo, useRef, useState, useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const loadChartJs = () => new Promise((resolve, reject) => {
  if (window.Chart) return resolve(window.Chart)
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
  script.onload = () => resolve(window.Chart)
  script.onerror = () => reject(new Error('Failed to load Chart.js'))
  document.body.appendChild(script)
})

const Reports = () => {
  const { backendUrl, aToken } = useContext(AdminContext)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [granularity, setGranularity] = useState('month')
  const [loading, setLoading] = useState(false)

  const timeCanvas = useRef(null)
  const specCanvas = useRef(null)
  const chartsRef = useRef({})

  const headers = useMemo(() => ({ atoken: aToken }), [aToken])

  const fetchData = async () => {
    try{
      setLoading(true)
      const params = {}
      if(from) params.from = from
      if(to) params.to = to

      const [Chart] = await Promise.all([loadChartJs()])

      const urlTs = `${backendUrl}/api/admin/analytics/appointments/time-series`
      const urlBs = `${backendUrl}/api/admin/analytics/appointments/by-speciality`

      console.log('Analytics URLs', { urlTs, urlBs, params: { ...params, granularity }, headers })

      let ts, bs
      try{ 
        console.log('Fetching time-series...')
        ts = await axios.get(urlTs, { params: { ...params, granularity }, headers }) 
        console.log('Time-series response:', ts.data)
      }
      catch(err){ 
        console.error('TS error', err?.response?.status, err?.response?.data, err?.message)
        throw new Error(`Time-series failed (${err?.response?.status || err?.message || 'Unknown error'})`) 
      }
      try{ 
        console.log('Fetching by-speciality...')
        bs = await axios.get(urlBs, { params, headers }) 
        console.log('By-speciality response:', bs.data)
      }
      catch(err){ 
        console.error('BS error', err?.response?.status, err?.response?.data, err?.message)
        throw new Error(`By-speciality failed (${err?.response?.status || err?.message || 'Unknown error'})`) 
      }

      if(!ts.data?.success || !bs.data?.success){ 
        console.error('API responses not successful:', { ts: ts.data, bs: bs.data })
        toast.error('Failed to load analytics'); 
        return 
      }

      // Time series chart
      const tsLabels = ts.data.series.map(s => s.date)
      const tsCounts = ts.data.series.map(s => s.count)
      const tsRevenue = ts.data.series.map(s => s.revenue)

      // Destroy old
      Object.values(chartsRef.current).forEach(ch => ch?.destroy?.())

      chartsRef.current.time = new Chart(timeCanvas.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: tsLabels,
          datasets: [
            { label: 'Appointments', data: tsCounts, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.15)', tension: 0.2 },
            { label: 'Revenue', data: tsRevenue, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.15)', tension: 0.2, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
            y1: { beginAtZero: true, position: 'right' }
          }
        }
      })

      // By speciality (bar)
      const specLabels = bs.data.items.map(i => i.speciality)
      const specCounts = bs.data.items.map(i => i.count)
      chartsRef.current.spec = new Chart(specCanvas.current.getContext('2d'), {
        type: 'bar',
        data: { labels: specLabels, datasets: [{ label: 'By Speciality', data: specCounts, backgroundColor: '#10b981' }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      })


    }catch(err){ toast.error(err.message) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ 
    console.log('Reports component mounted, aToken:', aToken, 'backendUrl:', backendUrl)
    
    // Test backend connection first
    const testConnection = async () => {
      try {
        console.log('Testing backend connection...')
        const response = await axios.get(`${backendUrl}/health`)
        console.log('Backend health check:', response.data)
      } catch (error) {
        console.error('Backend connection failed:', error.message)
        toast.error('Cannot connect to backend server')
      }
    }
    
    testConnection()
    fetchData() 
  }, [])

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-3 mb-2'>
        <h1 className='text-2xl font-bold text-gray-800'>Reports & Analytics</h1>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
        <div className='flex flex-wrap gap-3 items-end'>
          <div>
            <p className='text-sm text-gray-600'>From</p>
            <input type='date' value={from} onChange={e=> setFrom(e.target.value)} className='border rounded px-3 py-1.5 text-sm' />
          </div>
          <div>
            <p className='text-sm text-gray-600'>To</p>
            <input type='date' value={to} onChange={e=> setTo(e.target.value)} className='border rounded px-3 py-1.5 text-sm' />
          </div>
          <div>
            <p className='text-sm text-gray-600'>Granularity</p>
            <select value={granularity} onChange={e=> setGranularity(e.target.value)} className='border rounded px-3 py-1.5 text-sm'>
              <option value='day'>Daily</option>
              <option value='month'>Monthly</option>
            </select>
          </div>
          <button onClick={fetchData} className='px-3 py-2 rounded border text-sm hover:bg-gray-50'>Apply</button>
          <button onClick={() => {
            console.log('Manual test - aToken:', aToken, 'backendUrl:', backendUrl)
            fetchData()
          }} className='px-3 py-2 rounded border text-sm bg-blue-500 text-white hover:bg-blue-600'>Test Connection</button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
          <p className='text-sm text-gray-600 mb-2'>Appointments & Revenue Over Time</p>
          <canvas ref={timeCanvas} height='160'></canvas>
        </div>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-4'>
          <p className='text-sm text-gray-600 mb-2'>By Speciality</p>
          <canvas ref={specCanvas} height='160'></canvas>
        </div>
      </div>

      {loading && <div className='text-sm text-gray-500'>Loading analytics…</div>}
    </div>
  )
}

export default Reports
