import React, { useEffect, useState, useContext, useMemo } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'

const Contacts = () => {
  const { backendUrl, aToken } = useContext(AdminContext)
  const [items, setItems] = useState([])
  const [replyMap, setReplyMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [sendingId, setSendingId] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | replied | pending

  const headers = { atoken: aToken }

  const load = async () => {
    try{
      setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/admin/contacts', { headers })
      if(data.success) setItems(data.contacts)
      else toast.error(data.message)
    }catch(err){ toast.error(err.message) }
    finally{ setLoading(false) }
  }

  const sendReply = async (id) => {
    try{
      const reply = (replyMap[id] || '').trim()
      if(!reply){ toast.error('Reply is required'); return }
      setSendingId(id)
      const { data } = await axios.post(backendUrl + `/api/admin/contacts/${id}/reply`, { reply }, { headers })
      if(data.success){ 
        toast.success('Reply sent')
        setReplyMap(prev=>({ ...prev, [id]: '' }))
        load() 
      }
      else toast.error(data.message)
    }catch(err){ toast.error(err.message) }
    finally{ setSendingId('') }
  }

  const deleteItem = async (id) => {
    try{
      const ok = window.confirm('Delete this contact message? This cannot be undone.')
      if(!ok) return
      const { data } = await axios.delete(backendUrl + `/api/admin/contacts/${id}`, { headers })
      if(data.success){
        toast.success('Contact deleted')
        setItems(prev => prev.filter(x => x._id !== id))
      } else {
        toast.error(data.message)
      }
    }catch(err){
      const status = err?.response?.status
      const msg = err?.response?.data?.message || err.message
      if(status === 404){
        toast.info('Contact already deleted')
        setItems(prev => prev.filter(x => x._id !== id))
        return
      }
      toast.error(msg)
    }
  }

  useEffect(()=>{ load() }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items
      .filter(it => filter === 'all' || it.status === (filter === 'pending' ? 'pending' : 'replied'))
      .filter(it => !term || it.name?.toLowerCase().includes(term) || it.email?.toLowerCase().includes(term) || it.subject?.toLowerCase().includes(term) || it.message?.toLowerCase().includes(term))
  }, [items, search, filter])

  const stats = useMemo(() => ({
    total: items.length,
    replied: items.filter(i => i.status === 'replied').length,
    pending: items.filter(i => i.status !== 'replied').length
  }), [items])

  return (
    <div className='p-5'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <img src={assets.list_icon} alt="Contact messages" className='w-6 h-6' />
          <h2 className='text-xl font-semibold'>Contact messages</h2>
        </div>
        <div className='flex gap-2'>
          <button onClick={load} className='px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-sm'>Refresh</button>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className='px-3 py-2 rounded-lg border border-zinc-200 text-sm'>
            <option value='all'>All</option>
            <option value='pending'>Pending</option>
            <option value='replied'>Replied</option>
          </select>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search name, email, subject…' className='px-3 py-2 rounded-lg border border-zinc-200 text-sm w-56'/>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-3 mb-4'>
        <div className='rounded-xl border border-zinc-200 p-3 text-center'>
          <p className='text-xs text-zinc-500'>Total</p>
          <p className='text-lg font-semibold text-zinc-800'>{stats.total}</p>
        </div>
        <div className='rounded-xl border border-zinc-200 p-3 text-center'>
          <p className='text-xs text-zinc-500'>Pending</p>
          <p className='text-lg font-semibold text-amber-600'>{stats.pending}</p>
        </div>
        <div className='rounded-xl border border-zinc-200 p-3 text-center'>
          <p className='text-xs text-zinc-500'>Replied</p>
          <p className='text-lg font-semibold text-emerald-600'>{stats.replied}</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className='py-12 text-center text-sm text-zinc-500'>Loading messages…</div>
      ) : filtered.length === 0 ? (
        <div className='py-12 text-center text-sm text-zinc-500'>No messages found.</div>
      ) : (
        <div className='grid gap-3'>
          {filtered.map(it => (
            <div key={it._id} className='rounded-xl border border-zinc-200 bg-white p-4 shadow-sm'>
              <div className='flex justify-between gap-3'>
                <div>
                  <p className='font-medium text-zinc-800'>{it.name} <span className='text-zinc-500 text-xs'>&lt;{it.email}&gt;</span></p>
                  <p className='text-sm text-zinc-600'>{it.subject || 'No subject'}</p>
                  <p className='text-[11px] text-zinc-400 mt-0.5'>{new Date(it.createdAt).toLocaleString()}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <span className={`px-3 py-1 rounded-full text-xs border ${it.status==='replied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>{it.status}</span>
                  <button onClick={()=> deleteItem(it._id)} className='text-red-600 text-xs hover:underline'>Delete</button>
                </div>
              </div>
              <p className='mt-3 text-sm text-zinc-700 whitespace-pre-wrap'>{it.message}</p>
              {it.adminReply && (
                <div className='mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800'>
                  <p className='font-medium'>Previous reply</p>
                  <p className='whitespace-pre-wrap'>{it.adminReply}</p>
                </div>
              )}
              <div className='mt-3 grid sm:grid-cols-[1fr_auto] gap-2'>
                <input 
                  value={replyMap[it._id] || ''}
                  onChange={e=> setReplyMap(prev=>({ ...prev, [it._id]: e.target.value }))}
                  placeholder='Type a reply to the user…'
                  className='w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary'
                />
                <button 
                  onClick={()=> sendReply(it._id)}
                  disabled={sendingId===it._id}
                  className={`px-4 py-2 rounded-lg text-white text-sm ${sendingId===it._id ? 'bg-gray-400 cursor-not-allowed':'bg-primary hover:opacity-90'}`}
                >
                  {sendingId===it._id ? 'Sending…':'Send reply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Contacts


