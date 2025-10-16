import React, { useEffect, useState, useContext } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const MyProfile = () => {
const { backendUrl, token, user, setUser } = useContext(AppContext)
const [userData, setUserData] = useState({
    name:"Sineth Dinsara",
    image:assets.profile_pic,
    email:'sinethdinsara@gmail.com',
    phone: '0703287271',
    address:{
      line1:"57th Cross, Richmond ",
      line2:"Malabe, Colombo"
    },
    gender: 'Male',
    dob: '2003-02-03'
  })

  const [isEdit,setIsEdit] = useState(false)
  const [isSaving,setIsSaving] = useState(false)
  const [errors,setErrors] = useState({})
  const [previewImg,setPreviewImg] = useState('')

  const fetchProfile = async () => {
    try{
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/me', { headers })
      if(data.success && data.user){
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
    }catch(err){ toast.error(err.message) }
  }

  const [messages, setMessages] = useState([])
  const loadMessages = async () => {
    try{
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await axios.get(backendUrl + '/api/user/my-contacts', { headers })
      if(data.success) setMessages(data.contacts)
    }catch{ /* silent */ }
  }

  const validate = () => {
    const newErrors = {}
    if(!userData.name?.trim()){ newErrors.name = 'Name is required' }
    if(userData.phone && !/^0[0-9]{9}$/.test(userData.phone.replace(/\D/g,''))){ newErrors.phone = 'Phone number must start with 0 and be exactly 10 digits' }
    if(userData.dob && new Date(userData.dob) > new Date()){ newErrors.dob = 'DOB cannot be in the future' }
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
    if(!file) return
    if(file.size > 2 * 1024 * 1024){
      toast.error('Image too large. Max 2MB')
      return
    }
    try{
      const b64 = await toBase64(file)
      setPreviewImg(b64)
      setUserData(prev=>({...prev,image:b64}))
    }catch{ toast.error('Failed to read image') }
  }

  const saveProfile = async () => {
    if(!validate()) { toast.error('Please fix the errors'); return }
    try{
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
      if(data.success){
        toast.success('Profile updated')
        setIsEdit(false)
        if(data.user){ setUser(data.user) }
      }
      else toast.error(data.message)
    }catch(err){ toast.error(err.message) }
    finally{ setIsSaving(false) }
  }

  useEffect(()=>{ fetchProfile(); loadMessages() },[])
  useEffect(()=>{
    if(user){
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
  },[user])

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='relative rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-sm'>
        <div className='h-36 sm:h-44 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500'></div>
        <div className='px-6 sm:px-8 pb-6'>
          <div className='-mt-12 flex items-end gap-4'>
            <div className='relative'>
              <img className='w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white object-cover' src={previewImg || userData.image} alt="" />
              {isEdit && (
                <label htmlFor='avatar-upload' className='absolute -right-2 -bottom-2 px-2.5 py-1.5 text-xs rounded-full bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 cursor-pointer'>Change</label>
              )}
              <input id='avatar-upload' type='file' accept='image/*' className='hidden' onChange={onChangePhoto}/>
            </div>
            <div className='flex-1'>
              {
                isEdit
                ? <input className='w-full bg-transparent text-2xl sm:text-3xl font-semibold text-neutral-900 border-b border-zinc-200 focus:outline-none focus:border-primary' type="text" value={userData.name} onChange={e => setUserData(prev=>({...prev,name:e.target.value}))} placeholder='Your name' />
                : <p className='text-2xl sm:text-3xl font-semibold text-neutral-900'>{userData.name}</p>
              }
              <p className='text-sm text-zinc-500 mt-1'>{userData.email}</p>
              {errors.name && <p className='text-xs text-red-600 mt-1'>{errors.name}</p>}
            </div>
            <div className='hidden sm:flex gap-2'>
              {!isEdit && <button className='px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50' onClick={()=>setIsEdit(true)}>Edit profile</button>}
              {isEdit && (
                <>
                  <button disabled={isSaving} className={`px-4 py-2 rounded-full bg-primary text-white hover:opacity-90 ${isSaving?'opacity-70 cursor-not-allowed':''}`} onClick={saveProfile}>{isSaving?'Saving...':'Save changes'}</button>
                  <button disabled={isSaving} className='px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50' onClick={()=>{ setIsEdit(false); setErrors({}); setPreviewImg('') }}>Cancel</button>
                </>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className='mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center'>
            <div className='rounded-xl border border-zinc-200 p-3'>
              <p className='text-xs text-zinc-500'>Appointments</p>
              <p className='text-lg font-semibold text-zinc-800'>—</p>
            </div>
            <div className='rounded-xl border border-zinc-200 p-3'>
              <p className='text-xs text-zinc-500'>Last visit</p>
              <p className='text-lg font-semibold text-zinc-800'>—</p>
            </div>
            <div className='rounded-xl border border-zinc-200 p-3'>
              <p className='text-xs text-zinc-500'>Gender</p>
              {
                isEdit
                ? <select className='max-w-28 bg-gray-50 border border-zinc-200 rounded px-2 py-1' onChange={(e) => setUserData(prev=> ({...prev,gender:e.target.value}))} value={userData.gender}>
                    <option value = "Male">Male</option>
                    <option value = "Female">Female</option>
                  </select>
                : <p className='text-lg font-semibold text-zinc-800'>{userData.gender}</p>
              }
            </div>
            <div className='rounded-xl border border-zinc-200 p-3'>
              <p className='text-xs text-zinc-500'>DOB</p>
              {
                isEdit
                ? <>
                    <input className='w-full bg-gray-50 border border-zinc-200 rounded px-2 py-1' type="date" onChange={(e) => setUserData(prev=> ({...prev,dob:e.target.value}))} value={userData.dob}/>
                    {errors.dob && <p className='text-xs text-red-600 mt-1'>{errors.dob}</p>}
                  </>
                : <p className='text-lg font-semibold text-zinc-800'>{userData.dob}</p>
              }
            </div>
          </div>

          {/* Contact */}
          <div className='mt-8 grid sm:grid-cols-2 gap-6'>
            <div className='rounded-2xl border border-zinc-200 p-5'>
              <p className='text-sm font-medium text-neutral-800'>Contact information</p>
              <div className='mt-4 grid grid-cols-[1fr_3fr] gap-y-3 text-sm text-neutral-700'>
                <p className='font-medium'>Email</p>
                <p className='text-blue-600 break-all'>{userData.email}</p>
                <p className='font-medium'>Phone</p>
                {
                  isEdit
                  ? <div>
                      <input className='bg-gray-50 border border-zinc-200 rounded px-2 py-1 max-w-60' type="text" value={userData.phone} onChange={e => setUserData(prev=>({...prev,phone:e.target.value}))} placeholder='07XXXXXXXX' />
                      {errors.phone && <p className='text-xs text-red-600 mt-1'>{errors.phone}</p>}
                    </div>
                  : <p className='text-zinc-600'>{userData.phone}</p>
                }
                <p className='font-medium'>Address</p>
                {
                  isEdit
                  ? <div className='space-y-2'>
                      <input className='w-full bg-gray-50 border border-zinc-200 rounded px-2 py-1' onChange={(e) => setUserData(prev=> ({...prev, address:{...prev.address, line1: e.target.value}}))} value={userData.address.line1} type="text" placeholder='Address line 1'/>
                      <input className='w-full bg-gray-50 border border-zinc-200 rounded px-2 py-1' onChange={(e) => setUserData(prev=> ({...prev, address:{...prev.address, line2: e.target.value}}))} value={userData.address.line2} type="text" placeholder='Address line 2'/>
                    </div>
                  : <p className='text-zinc-600'>
                      {userData.address.line1}<br/>{userData.address.line2}
                    </p>
                }
              </div>
            </div>

            <div className='rounded-2xl border border-zinc-200 p-5'>
              <p className='text-sm font-medium text-neutral-800'>Basic information</p>
              <div className='mt-4 grid grid-cols-[1fr_3fr] gap-y-3 text-sm text-neutral-700'>
                <p className='font-medium'>Gender</p>
                {
                  isEdit
                  ? <select className='max-w-28 bg-gray-50 border border-zinc-200 rounded px-2 py-1' onChange={(e) => setUserData(prev=> ({...prev,gender:e.target.value}))} value={userData.gender}>
                      <option value = "Male">Male</option>
                      <option value = "Female">Female</option>
                    </select>
                  : <p className='text-zinc-600'>{userData.gender}</p>
                }
                <p className='font-medium'>Birthday</p>
                {
                  isEdit
                  ? <input className='max-w-40 bg-gray-50 border border-zinc-200 rounded px-2 py-1' type="date" onChange={(e) => setUserData(prev=> ({...prev,dob:e.target.value}))} value={userData.dob}/>
                  : <p className='text-zinc-600'>{userData.dob}</p>
                }
              </div>
            </div>
          </div>

          {/* Messages and replies */}
          <div className='mt-8 rounded-2xl border border-zinc-200 p-5'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-neutral-800'>Messages & replies</p>
              <span className='text-xs text-zinc-500'>{messages.length} total</span>
            </div>
            {messages.length === 0 ? (
              <p className='text-sm text-zinc-500 mt-3'>No messages yet.</p>
            ) : (
              <div className='mt-3 grid gap-3'>
                {messages.map(m => (
                  <div key={m._id} className='rounded-xl border border-zinc-200 p-3 bg-white'>
                    <div className='flex justify-between text-xs'>
                      <span className='text-zinc-500'>{new Date(m.createdAt).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full border ${m.status==='replied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{m.status}</span>
                    </div>
                    <p className='mt-2 text-sm text-zinc-800 whitespace-pre-wrap'>{m.message}</p>
                    {m.adminReply && (
                      <div className='mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800'>
                        <p className='font-medium'>Reply</p>
                        <p className='whitespace-pre-wrap'>{m.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className='sm:hidden mt-6 flex gap-3'>
            {!isEdit && <button className='flex-1 px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50' onClick={()=>setIsEdit(true)}>Edit profile</button>}
            {isEdit && (
              <>
                <button disabled={isSaving} className={`flex-1 px-4 py-2 rounded-full bg-primary text-white ${isSaving?'opacity-70 cursor-not-allowed':'hover:opacity-90'}`} onClick={saveProfile}>{isSaving?'Saving...':'Save changes'}</button>
                <button disabled={isSaving} className='flex-1 px-4 py-2 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50' onClick={()=>{ setIsEdit(false); setErrors({}); setPreviewImg('') }}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
