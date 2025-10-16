import React, { useState,useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {

const{backendUrl,token,setToken,setUser}= useContext(AppContext)
const navigate = useNavigate()

const [mode, setMode] = useState('Sign Up')

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [name, setName] = useState('')

// Validation states
const [errors, setErrors] = useState({})
const [isValidating, setIsValidating] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}

const validateName = (name) => {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name)
}

const validateForm = () => {
  const newErrors = {}
  
  // Email validation
  if (!email.trim()) {
    newErrors.email = 'Email is required'
  } else if (!validateEmail(email)) {
    newErrors.email = 'Please enter a valid email address'
  }
  
  // Password validation
  if (!password.trim()) {
    newErrors.password = 'Password is required'
  } else {
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password must meet all requirements'
    }
  }
  
  // Name validation (only for sign up)
  if (mode === 'Sign Up') {
    if (!name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (!validateName(name)) {
      newErrors.name = 'Name must contain only letters and be at least 2 characters'
    }
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

// Real-time validation
const handleEmailChange = (e) => {
  const value = e.target.value
  setEmail(value)
  
  if (value && !validateEmail(value)) {
    setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
  } else if (value && validateEmail(value)) {
    setErrors(prev => ({ ...prev, email: '' }))
  }
}

const handlePasswordChange = (e) => {
  const value = e.target.value
  setPassword(value)
  
  if (value) {
    const passwordValidation = validatePassword(value)
    if (!passwordValidation.isValid) {
      setErrors(prev => ({ ...prev, password: 'Password must meet all requirements' }))
    } else {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }
}

const handleNameChange = (e) => {
  const value = e.target.value
  setName(value)
  
  if (value && !validateName(value)) {
    setErrors(prev => ({ ...prev, name: 'Name must contain only letters and be at least 2 characters' }))
  } else if (value && validateName(value)) {
    setErrors(prev => ({ ...prev, name: '' }))
  }
}

const onSubmitHandler = async (event) => {
  event.preventDefault()
  
  // Validate form before submission
  if (!validateForm()) {
    toast.error('Please fix the errors before submitting')
    return
  }

  setIsValidating(true)

  try{
    if(mode==='Sign Up'){
      const {data}= await axios.post(backendUrl + '/api/user/register',{name,password,email})
      if (data.success){
        // Auto-login right after signup
        const loginRes = await axios.post(backendUrl + '/api/user/login',{password,email})
        if(loginRes.data?.success){
          localStorage.setItem('token',loginRes.data.token)
          setToken(loginRes.data.token)
          try{
            const headers = { Authorization: `Bearer ${loginRes.data.token}` }
            const profile = await axios.get(backendUrl + '/api/user/me', { headers })
            if(profile.data?.success){ setUser(profile.data.user) }
          }catch{ /* non-blocking */ }
          // Scroll to top to show toast at top of home page
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
          setIsSuccess(true)
          toast.success('Account created successfully! Welcome to MediCura!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
          // Reset success state after a delay
          setTimeout(() => {
            setIsSuccess(false)
          }, 2000)
        }else{
          toast.error(loginRes.data?.message || 'Login failed after signup')
          setMode('Login')
        }
      }else{
        toast.error(data.message)
      }
    }else{
      const {data}= await axios.post(backendUrl + '/api/user/login',{password,email})
      if (data.success){
        localStorage.setItem('token',data.token)
        setToken(data.token)
        try{
          const headers = { Authorization: `Bearer ${data.token}` }
          const profile = await axios.get(backendUrl + '/api/user/me', { headers })
          if(profile.data?.success){ setUser(profile.data.user) }
        }catch{ /* non-blocking */ }
        // Scroll to top to show toast at top of home page
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        setIsSuccess(true)
        toast.success('Welcome back! You have successfully logged in.', {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        // Reset success state after a delay
        setTimeout(() => {
          setIsSuccess(false)
        }, 2000)
      }else{
        toast.error(data.message)
      }
    }

  }catch(error){
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
    toast.error(`❌ ${errorMessage}`, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  } finally {
    setIsValidating(false)
  }
}

useEffect(()=>{
  if (token){
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    navigate('/')
  }
},[token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[60vh] flex items-center justify-center'>
      <div className='w-full max-w-md border border-gray-300 bg-white rounded-xl p-6'>
        <div className='mb-6'>
          <p className='text-2xl font-semibold text-gray-900'>
            {mode === 'Sign Up' ? 'Create Account' : 'Login'}
          </p>
          <p className='text-gray-500 text-sm mt-1'>
            Please {mode === 'Sign Up' ? 'sign up' : 'log in'} to book appointment
          </p>
          
          {/* Success Message */}
          {isSuccess && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md animate-pulse">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {mode === 'Sign Up' ? 'Account created successfully! Redirecting...' : 'Login successful! Redirecting...'}
              </div>
            </div>
          )}
        </div>

        {mode === 'Sign Up' && (
          <div className='mb-4'>
            <p className='text-sm text-gray-700 mb-1'>Full Name <span className='text-red-500'>*</span></p>
            <input 
              className={`w-full border rounded-md px-3 py-2 outline-none transition-colors ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              type="text" 
              onChange={handleNameChange} 
              value={name} 
              required 
            />
            {errors.name && <p className='text-red-500 text-xs mt-1'>{errors.name}</p>}
          </div>
        )}

        <div className='mb-4'>
          <p className='text-sm text-gray-700 mb-1'>Email <span className='text-red-500'>*</span></p>
          <input 
            className={`w-full border rounded-md px-3 py-2 outline-none transition-colors ${
              errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            type="email" 
            onChange={handleEmailChange} 
            value={email} 
            required 
          />
          {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
        </div>

        <div className='mb-6'>
          <p className='text-sm text-gray-700 mb-1'>Password <span className='text-red-500'>*</span></p>
          <input 
            className={`w-full border rounded-md px-3 py-2 outline-none transition-colors ${
              errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            type="password" 
            onChange={handlePasswordChange} 
            value={password} 
            required 
          />
          {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
          
          {/* Password requirements for sign up */}
          {mode === 'Sign Up' && password && (
            <div className='mt-2 text-xs'>
              <p className='text-gray-600 mb-1'>Password must contain:</p>
              <div className='space-y-1'>
                <div className={`flex items-center ${validatePassword(password).minLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className='mr-2'>{validatePassword(password).minLength ? '✓' : '○'}</span>
                  At least 8 characters
                </div>
                <div className={`flex items-center ${validatePassword(password).hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className='mr-2'>{validatePassword(password).hasUpperCase ? '✓' : '○'}</span>
                  One uppercase letter
                </div>
                <div className={`flex items-center ${validatePassword(password).hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className='mr-2'>{validatePassword(password).hasLowerCase ? '✓' : '○'}</span>
                  One lowercase letter
                </div>
                <div className={`flex items-center ${validatePassword(password).hasNumbers ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className='mr-2'>{validatePassword(password).hasNumbers ? '✓' : '○'}</span>
                  One number
                </div>
                <div className={`flex items-center ${validatePassword(password).hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className='mr-2'>{validatePassword(password).hasSpecialChar ? '✓' : '○'}</span>
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type='submit' 
          disabled={isValidating || isSuccess}
          className={`w-full py-2 rounded-full transition-all duration-300 ${
            isSuccess
              ? 'bg-green-500 cursor-default'
              : isValidating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90'
          } text-white`}
        >
          {isSuccess ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'Sign Up' ? 'Account Created!' : 'Logged In!'}
            </div>
          ) : isValidating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            mode === 'Sign Up' ? 'Create Account' : 'Login'
          )}
        </button>

        <p className='text-center text-sm text-gray-600 mt-4'>
          {mode === 'Sign Up' ? 'Already have an account?' : "Don't have an account?"}
          <span 
            onClick={()=> {
              setMode(mode === 'Sign Up' ? 'Login' : 'Sign Up')
              setErrors({}) // Clear errors when switching modes
              setIsSuccess(false) // Clear success state when switching modes
            }} 
            className='ml-1 text-primary cursor-pointer hover:underline'
          >
            {mode === 'Sign Up' ? 'Login here' : 'Sign up here'}
          </span>
        </p>
      </div>
    </form>
  );
}
  
  export default Login;
