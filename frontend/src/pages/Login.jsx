import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {

  const { backendUrl, token, setToken, setUser } = useContext(AppContext)
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

    try {
      if (mode === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email })
        if (data.success) {
          // Auto-login right after signup
          const loginRes = await axios.post(backendUrl + '/api/user/login', { password, email })
          if (loginRes.data?.success) {
            localStorage.setItem('token', loginRes.data.token)
            setToken(loginRes.data.token)
            try {
              const headers = { Authorization: `Bearer ${loginRes.data.token}` }
              const profile = await axios.get(backendUrl + '/api/user/me', { headers })
              if (profile.data?.success) { setUser(profile.data.user) }
            } catch { /* non-blocking */ }
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
          } else {
            toast.error(loginRes.data?.message || 'Login failed after signup')
            setMode('Login')
          }
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { password, email })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          try {
            const headers = { Authorization: `Bearer ${data.token}` }
            const profile = await axios.get(backendUrl + '/api/user/me', { headers })
            if (profile.data?.success) { setUser(profile.data.user) }
          } catch { /* non-blocking */ }
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
        } else {
          toast.error(data.message)
        }
      }

    } catch (error) {
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

  useEffect(() => {
    if (token) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center justify-center py-12 px-4'>
      <div className='relative group'>
        <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000'></div>
        <div className='w-full max-w-md relative glass-card p-10 flex flex-col'>
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-black text-white uppercase tracking-widest'>
              {mode === 'Sign Up' ? 'Initialize' : 'Access'} <span className='neon-text'>Neural</span>
            </h1>
            <p className='text-gray-500 text-sm mt-2 font-medium'>
              {mode === 'Sign Up' ? 'Register your identity in the Medicura network.' : 'Authenticate your credentials for nexus access.'}
            </p>

            {/* Success Message */}
            {isSuccess && (
              <div className="mt-6 glass-card border-green-500 bg-green-500/10 p-4 text-green-400 animate-pulse">
                <div className="flex items-center justify-center font-bold uppercase tracking-tighter text-sm">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {mode === 'Sign Up' ? 'Identity Synchronized' : 'Access Granted'}
                </div>
              </div>
            )}
          </div>

          <div className='space-y-5'>
            {mode === 'Sign Up' && (
              <div>
                <label className='block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest'>Full Identity</label>
                <input
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-all ${errors.name ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-neon-cyan'
                    }`}
                  placeholder="EX: DR. KALEB STONE"
                  type="text"
                  onChange={handleNameChange}
                  value={name}
                  required
                />
                {errors.name && <p className='text-red-500 text-[10px] mt-1 font-bold uppercase'>{errors.name}</p>}
              </div>
            )}

            <div>
              <label className='block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest'>Comms Protocol (Email)</label>
              <input
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-all ${errors.email ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-neon-cyan'
                  }`}
                placeholder="YOURNAME@QUANTUM.NET"
                type="email"
                onChange={handleEmailChange}
                value={email}
                required
              />
              {errors.email && <p className='text-red-500 text-[10px] mt-1 font-bold uppercase'>{errors.email}</p>}
            </div>

            <div>
              <label className='block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest'>Security Cipher</label>
              <input
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white outline-none transition-all ${errors.password ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-neon-purple'
                  }`}
                placeholder="••••••••••••"
                type="password"
                onChange={handlePasswordChange}
                value={password}
                required
              />
              {errors.password && <p className='text-red-500 text-[10px] mt-1 font-bold uppercase'>{errors.password}</p>}

              {/* Password requirements for sign up */}
              {mode === 'Sign Up' && password && (
                <div className='mt-4 glass-card border-none bg-cyber-dark/50 p-4 space-y-2'>
                  <p className='text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2'>Complexity Matrix</p>
                  {[
                    { label: '8+ Characters', met: validatePassword(password).minLength },
                    { label: 'Upper Case', met: validatePassword(password).hasUpperCase },
                    { label: 'Lower Case', met: validatePassword(password).hasLowerCase },
                    { label: 'Numeric Data', met: validatePassword(password).hasNumbers },
                    { label: 'Neural Token (Special)', met: validatePassword(password).hasSpecialChar }
                  ].map((req, idx) => (
                    <div key={idx} className={`flex items-center text-[10px] font-bold uppercase tracking-tighter transition-colors ${req.met ? 'text-neon-cyan' : 'text-gray-600'}`}>
                      <span className={`w-3 h-3 mr-2 rounded-full border ${req.met ? 'bg-neon-cyan border-neon-cyan shadow-neon-glow' : 'border-gray-700'}`}></span>
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type='submit'
            disabled={isValidating || isSuccess}
            className={`w-full mt-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden relative group/btn ${isSuccess
                ? 'bg-green-500 text-white'
                : isValidating
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'neon-button'
              }`}
          >
            <span className='relative z-10'>
              {isSuccess ? 'Verified' : isValidating ? 'Syncing...' : mode === 'Sign Up' ? 'Initiate Account' : 'Authenticate'}
            </span>
          </button>

          <p className='text-center text-[11px] font-bold text-gray-500 mt-8 uppercase tracking-widest'>
            {mode === 'Sign Up' ? 'Already in the network?' : "New identity required?"}
            <span
              onClick={() => {
                setMode(mode === 'Sign Up' ? 'Login' : 'Sign Up')
                setErrors({})
                setIsSuccess(false)
              }}
              className='ml-2 text-neon-cyan cursor-pointer hover:text-neon-purple transition-colors drop-shadow-neon-glow'
            >
              {mode === 'Sign Up' ? 'ACCESS_HERE' : 'GENERATE_INIT'}
            </span>
          </p>
        </div>
      </div>
    </form>
  );
}

export default Login;
