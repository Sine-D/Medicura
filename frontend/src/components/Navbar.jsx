import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext';

const Navbar = () => {

  const navigate = useNavigate();
  const { token, setToken } = useContext(AppContext)

  const logout = () => {
    setToken("")
    localStorage.removeItem('token')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 glass-nav px-4 sm:px-[10%] mb-8 left-0 right-0'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer hover:drop-shadow-neon-glow transition-all' src={assets.logo} alt="" />
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>HOME</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
        <NavLink to='/Doctors' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>ALL DOCTORS</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
        <NavLink to='/About' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>ABOUT</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
        <NavLink to='/Contact' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>CONTACT</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
        <NavLink to='/E-Pharmacy' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>E-PHARMACY</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
        <NavLink to='/Laborotory' className="relative group">
          <li className='py-1 transition-colors hover:text-neon-cyan'>LABOROTORY</li>
          <hr className='absolute bottom-0 left-0 w-0 h-0.5 bg-neon-cyan transition-all group-hover:w-full hidden' />
        </NavLink>
      </ul>
      <div className='flex items-center gap-4'>
        {
          token
            ? <div className='flex items-center gap-2 cursor-pointer group relative'>
              <img className='w-8 rounded-full border border-neon-cyan shadow-neon-glow' src={assets.profile_pic} alt="" />
              <img className='w-2.5 invert' src={assets.dropdown_icon} alt="" />
              <div className='absolute top-0 pt-14 text-base font-small z-20 hidden group-hover:block'>
                <div className='min-w-48 glass-card flex flex-col gap-4 p-4'>
                  <p onClick={() => navigate('MyProfile')} className='hover:text-neon-cyan cursor-pointer transition-colors'>My Profile</p>
                  <p onClick={() => navigate('MyAppointments')} className='hover:text-neon-cyan cursor-pointer transition-colors'>My Appointments</p>
                  <p onClick={logout} className='hover:text-neon-cyan cursor-pointer transition-colors'>Logout</p>
                </div>
              </div>
            </div>
            : <button onClick={() => navigate('/Login')} className='neon-button hidden md:block'>Create Account</button>
        }
      </div>
    </div>
  )
}

export default Navbar