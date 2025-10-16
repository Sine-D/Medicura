import React, { useContext } from 'react'
import {assets} from '../../assets/assets'
import { useState } from 'react'
import {AdminContext} from '../../context/AdminContext'
import {toast} from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [loading, setLoading] = useState(false)

  const {backendUrl, aToken} = useContext(AdminContext)

  const onSubmitHandler = async(event)=>{
    event.preventDefault()

    try{
      setLoading(true)
      
      // Validation
      if (!docImg){
        setLoading(false)
        return toast.error('Please select a doctor image')
      }

      if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address1 || !address2){
        setLoading(false)
        return toast.error('Please fill all required fields')
      }

      if (password.length < 4){
        setLoading(false)
        return toast.error('Password must be at least 4 characters long')
      }

      const formData = new FormData()

      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({line1: address1, line2: address2}))

      console.log('Sending data to backend...')
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`)
      })

      const {data} = await axios.post(backendUrl + '/api/admin/add-doctor', formData, {
        headers: {
          'aToken': aToken,
          'Content-Type': 'multipart/form-data'
        }
      })

      if(data.success){
        toast.success(data.message)
        // Reset form after successful submission
        setName('')
        setEmail('')
        setPassword('')
        setExperience('')
        setFees('')
        setAbout('')
        setSpeciality('')
        setDegree('')
        setAddress1('')
        setAddress2('')
        setDocImg(false)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.error('Error adding doctor:', error)
      const errorMessage = error.response?.data?.message || error.message
      if (errorMessage) {
        toast.error(errorMessage)
        // If session expired, clear token and redirect to login
        if(errorMessage.includes('Session expired') || errorMessage.includes('expired')){
          localStorage.removeItem('aToken')
          window.location.reload() // This will trigger a redirect to login
        }
      } else {
        toast.error('Failed to add doctor. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add Doctor</h1>
        <p className="text-gray-600 mt-2">Add a new doctor to the system</p>
      </div>
      <form onSubmit={onSubmitHandler} className='w-full'>
      <div className='bg-white px-6 py-6 border rounded w-full max-w-5xl max-h-[85vh] overflow-y-scroll'>
        {/* Image Upload Section */}
        <div className='flex items-center gap-4 mb-6 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-14 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg):assets.upload_area} alt="" />
          </label>
          <input onChange={(e)=>setDocImg(e.target.files[0])} type = "file" id="doc-img" hidden/>
          <p>Upload doctor image</p>
        </div>

        {/* Form Fields Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          {/* Left Column */}
          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Doctor Name</p>
              <input onChange={(e)=> setName(e.target.value)} value={name} className='border rounded px-3 py-2 text-sm' type="text" placeholder='Enter doctor name' required/>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Email</p>
              <input onChange={(e)=> setEmail(e.target.value)} value={email} className='border rounded px-3 py-2 text-sm' type="email" placeholder='Enter email' required/>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Password</p>
              <input onChange={(e)=> setPassword(e.target.value)} value={password} minLength={4} className='border rounded px-3 py-2 text-sm' type="password" placeholder='Enter password' required/>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Experience</p>
              <select onChange={(e)=> setExperience(e.target.value)} value={experience} className='border rounded px-3 py-2 text-sm' name="" id="">
                <option value="">Select experience</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Speciality</p>
              <select onChange={(e)=> setSpeciality(e.target.value)} value={speciality} className='border rounded px-3 py-2 text-sm' name="" id="">
                <option value="">Select speciality</option>
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Education</p>
              <input onChange={(e)=> setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2 text-sm' type="text" placeholder='Enter education details' required/>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Consultation Fees</p>
              <input onChange={(e)=> setFees(e.target.value)} value={fees} className='border rounded px-3 py-2 text-sm' type="number" placeholder='Enter fees' required/>
            </div>

            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium text-gray-700'>Address</p>
              <input onChange={(e)=> setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2 text-sm mb-2' type="text" placeholder='Address line 1' required/>
              <input onChange={(e)=> setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2 text-sm' type="text" placeholder='Address line 2' required/>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className='mb-4'>
          <p className='text-sm font-medium text-gray-700 mb-2'>About Doctor</p>
          <textarea onChange={(e)=> setAbout(e.target.value)} value={about} className='w-full px-3 py-2 border rounded text-sm' placeholder='Write about the doctor' rows={3} required/>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end'>
          <button 
            type='submit' 
            disabled={loading}
            className={`px-8 py-2 text-white rounded-full text-sm font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {loading ? 'Adding Doctor...' : 'Add Doctor'}
          </button>
        </div>
      </div>
      </form>
    </div>
  )
}

export default AddDoctor