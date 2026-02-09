import React, { useEffect, useState, useContext } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const MyProfile = () => {
  const { backendUrl, token, user, setUser } = useContext(AppContext)
  const [userData, setUserData] = useState({
    name: "Sineth Dinsara",
    image: assets.profile_pic,
    email: 'sinethdinsara@gmail.com',
    phone: '0703287271',
    address: {
      line1: "57th Cross, Richmond ",
      line2: "Malabe, Colombo"
    },
    gender: 'Male',
    dob: '2003-02-03'
  })

  const [isEdit, setIsEdit] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [previewImg, setPreviewImg] = useState('')

  const fetchProfile = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/me', { headers })
      if (data.success && data.user) {
        setUserData(prev => ({
          ...prev,
          name: data.user.name || prev.name,
          image: data.user.image || prev.image,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
          address: data.user.address || prev.address,
          gender: data.user.gender || prev.gender,
          dob: data.user.dob || prev.dob
        }))
      }
    } catch (err) { toast.error(err.message) }
  }

  const [messages, setMessages] = useState([])
  const loadMessages = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/my-contacts', { headers })
      if (data.success) setMessages(data.contacts)
    } catch { /* silent */ }
  }

  const validate = () => {
    const newErrors = {}
    if (!userData.name?.trim()) { newErrors.name = 'Name is required' }
    if (userData.phone && !/^0[0-9]{9}$/.test(userData.phone.replace(/\D/g, ''))) { newErrors.phone = 'Phone number must start with 0 and be exactly 10 digits' }
    if (userData.dob && new Date(userData.dob) > new Date()) { newErrors.dob = 'DOB cannot be in the future' }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const onChangePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Max 2MB')
      return
    }
    try {
      const b64 = await toBase64(file)
      setPreviewImg(b64)
      setUserData(prev => ({ ...prev, image: b64 }))
    } catch { toast.error('Failed to read image') }
  }

  const saveProfile = async () => {
    if (!validate()) { toast.error('Please fix the errors'); return }
    try {
      setIsSaving(true)
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      const payload = {
        name: userData.name,
        image: userData.image,
        phone: userData.phone,
        address: userData.address,
        gender: userData.gender,
        dob: userData.dob
      }
      const { data } = await axios.put(backendUrl + '/api/user/me', payload, { headers })
      if (data.success) {
        toast.success('Profile updated')
        setIsEdit(false)
        if (data.user) { setUser(data.user) }
      }
      else toast.error(data.message)
    } catch (err) { toast.error(err.message) }
    finally { setIsSaving(false) }
  }

  useEffect(() => { fetchProfile(); loadMessages() }, [])
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.name || prev.name,
        image: user.image || prev.image,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        gender: user.gender || prev.gender,
        dob: user.dob || prev.dob
      }))
    }
  }, [user])

  return (
    <div className='max-w-5xl mx-auto py-10 px-4'>
      <div className='relative group'>
        <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000'></div>
        <div className='relative glass-card overflow-hidden'>
          {/* Header Banner */}
          <div className='h-40 sm:h-52 bg-cyber-dark relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 animate-pulse'></div>
            <div className='absolute inset-0 backdrop-blur-[2px]'></div>
            <div className='absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cyber-black to-transparent'></div>
          </div>

          <div className='px-6 sm:px-12 pb-10 relative'>
            {/* Profile Avatar & Name Section */}
            <div className='-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6'>
              <div className='relative group/avatar'>
                <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-3xl blur opacity-50 group-hover/avatar:opacity-100 transition duration-500'></div>
                <img className='w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-cyber-black relative z-10 object-cover shadow-2xl' src={previewImg || userData.image} alt="User Matrix" />
                {isEdit && (
                  <label htmlFor='avatar-upload' className='absolute -right-2 -bottom-2 z-20 p-2.5 rounded-2xl bg-neon-cyan text-black shadow-neon-glow cursor-pointer hover:scale-110 transition-transform'>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </label>
                )}
                <input id='avatar-upload' type='file' accept='image/*' className='hidden' onChange={onChangePhoto} />
              </div>

              <div className='flex-1 text-center sm:text-left pt-2 pb-2'>
                {isEdit ? (
                  <input
                    className='w-full bg-white/5 text-3xl sm:text-4xl font-black text-white border-b-2 border-neon-cyan focus:outline-none uppercase tracking-tighter'
                    type="text"
                    value={userData.name}
                    onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  />
                ) : (
                  <h1 className='text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter drop-shadow-neon-glow'>{userData.name}</h1>
                )}
                <p className='text-neon-cyan text-sm font-bold tracking-widest mt-2 uppercase'>{userData.email}</p>
                {errors.name && <p className='text-[10px] text-red-500 font-bold uppercase mt-1'>{errors.name}</p>}
              </div>

              <div className='flex gap-3 mt-4 sm:mt-0'>
                {!isEdit ? (
                  <button className='neon-button px-6 py-2.5 text-xs' onClick={() => setIsEdit(true)}>Edit Matrix</button>
                ) : (
                  <>
                    <button disabled={isSaving} className='px-6 py-2.5 rounded-xl bg-neon-cyan text-black text-xs font-black uppercase tracking-widest hover:shadow-neon-glow disabled:opacity-50' onClick={saveProfile}>
                      {isSaving ? 'Syncing...' : 'Confirm'}
                    </button>
                    <button disabled={isSaving} className='px-6 py-2.5 rounded-xl border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5' onClick={() => { setIsEdit(false); setErrors({}); setPreviewImg('') }}>
                      Abort
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Content Grid */}
            <div className='mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8'>
              {/* Left Column: Core Data */}
              <div className='lg:col-span-2 space-y-8'>
                {/* Stats Matrix */}
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                  {[
                    { label: 'Neural Link', val: 'ACTIVE', color: 'text-green-400' },
                    { label: 'Identity Class', val: 'PIONEER', color: 'text-neon-cyan' },
                    { label: 'Gender Node', val: isEdit ? 'SELECT' : userData.gender.toUpperCase(), isSelect: true },
                    { label: 'Genesis Date', val: isEdit ? 'SET' : userData.dob, isDate: true }
                  ].map((stat, idx) => (
                    <div key={idx} className='glass-card p-4 border-white/5 hover:bg-white/5 transition-colors group/stat'>
                      <p className='text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1'>{stat.label}</p>
                      {stat.isSelect && isEdit ? (
                        <select className='bg-transparent text-white font-bold text-sm w-full outline-none' onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} value={userData.gender}>
                          <option value="Male">MALE</option>
                          <option value="Female">FEMALE</option>
                        </select>
                      ) : stat.isDate && isEdit ? (
                        <input className='bg-transparent text-white font-bold text-xs w-full outline-none' type="date" onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} value={userData.dob} />
                      ) : (
                        <p className={`text-sm font-black tracking-tighter ${stat.color || 'text-white'}`}>{stat.val}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Information Sections */}
                <div className='grid sm:grid-cols-2 gap-6'>
                  {/* Contact Info */}
                  <div className='glass-card p-6 border-l-4 border-l-neon-cyan'>
                    <h3 className='text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full bg-neon-cyan shadow-neon-glow'></span> Contact Coordinates
                    </h3>
                    <div className='space-y-4 text-xs'>
                      <div className='grid grid-cols-[80px_1fr] gap-2'>
                        <span className='text-gray-500 font-bold uppercase'>Neural ID</span>
                        <span className='text-neon-cyan font-bold truncate'>{userData.email}</span>

                        <span className='text-gray-500 font-bold uppercase'>Comms</span>
                        {isEdit ? (
                          <input className='bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-neon-cyan' type="text" value={userData.phone} onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))} />
                        ) : (
                          <span className='text-gray-300 font-bold'>{userData.phone}</span>
                        )}
                      </div>
                      <div className='pt-2'>
                        <span className='text-gray-500 font-bold uppercase block mb-2'>Sector Coordinates (Address)</span>
                        {isEdit ? (
                          <div className='space-y-2'>
                            <input className='w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-neon-cyan' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={userData.address.line1} type="text" placeholder='LEVEL 1' />
                            <input className='w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-neon-cyan' onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={userData.address.line2} type="text" placeholder='LEVEL 2' />
                          </div>
                        ) : (
                          <p className='text-gray-400 font-medium leading-relaxed uppercase tracking-tighter'>
                            {userData.address.line1} <br /> {userData.address.line2}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className='glass-card p-6 border-l-4 border-l-neon-purple'>
                    <h3 className='text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full bg-neon-purple shadow-neon-purple-glow'></span> Biological Metadata
                    </h3>
                    <div className='space-y-4 text-xs'>
                      <div className='grid grid-cols-[80px_1fr] gap-4'>
                        <span className='text-gray-500 font-bold uppercase'>Gender</span>
                        <span className='text-neon-purple font-bold'>{userData.gender.toUpperCase()}</span>

                        <span className='text-gray-500 font-bold uppercase'>Genesis</span>
                        <span className='text-gray-300 font-bold'>{userData.dob}</span>

                        <span className='text-gray-500 font-bold uppercase'>Status</span>
                        <span className='text-green-400 font-bold uppercase tracking-widest flex items-center gap-1'>
                          <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse'></span> Optimized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Section */}
                <div className='glass-card overflow-hidden'>
                  <div className='p-6 bg-white/5 border-b border-white/5 flex items-center justify-between'>
                    <h3 className='text-sm font-black text-white uppercase tracking-widest'>Neural Log (Messages)</h3>
                    <span className='text-[10px] bg-neon-cyan text-black font-black px-2 py-0.5 rounded'>{messages.length} ENTRIES</span>
                  </div>
                  <div className='p-6'>
                    {messages.length === 0 ? (
                      <div className='text-center py-10'>
                        <p className='text-gray-600 text-xs font-bold uppercase tracking-widest'>No transmissions found in history.</p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        {messages.map(m => (
                          <div key={m._id} className='glass-card p-5 border-white/5 bg-cyber-dark/30 hover:bg-white/5 transition-all group/msg'>
                            <div className='flex justify-between items-center mb-4'>
                              <span className='text-[10px] text-gray-500 font-black uppercase'>{new Date(m.createdAt).toLocaleString()}</span>
                              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${m.status === 'replied' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{m.status}</span>
                            </div>
                            <p className='text-sm text-gray-300 font-medium whitespace-pre-wrap leading-relaxed'>{m.message}</p>
                            {m.adminReply && (
                              <div className='mt-4 p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 relative'>
                                <div className='absolute -top-3 left-4 px-2 bg-cyber-black text-[10px] font-black text-neon-cyan uppercase tracking-widest'>Response</div>
                                <p className='text-sm text-neon-cyan font-medium whitespace-pre-wrap'>{m.adminReply}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Sidebar / Assets */}
              <div className='space-y-8'>
                <div className='glass-card p-8 text-center relative overflow-hidden group/card'>
                  <div className='absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700'></div>
                  <div className='relative z-10'>
                    <div className='w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-neon-glow/20'>
                      <svg className="w-10 h-10 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h4 className='text-white font-black uppercase tracking-widest mb-2'>Neural Security</h4>
                    <p className='text-xs text-gray-500 leading-relaxed'>Your personal metadata is encrypted with military-grade quantum protocols.</p>
                    <button className='w-full mt-6 py-3 rounded-xl border border-white/5 text-[10px] text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all'>Update Security Key</button>
                  </div>
                </div>

                <div className='glass-card p-8 border-t-4 border-t-neon-purple'>
                  <h4 className='text-white font-black uppercase tracking-widest mb-6 text-sm text-center'>Quick Actions</h4>
                  <div className='space-y-3'>
                    {['My Appointments', 'Health Records', 'Nexus Settings', 'Support Link'].map((action, i) => (
                      <button key={i} className='w-full py-3 px-4 rounded-xl bg-white/5 text-left text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-between group/action'>
                        {action.toUpperCase()}
                        <svg className="w-4 h-4 text-gray-700 group-hover/action:text-neon-purple transform group-hover/action:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
