import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {assets} from '../assets/assets'
import { AppContext } from '../context/AppContext';

const Navbar = () => {

  const navigate = useNavigate();
  const { token, setToken } = useContext(AppContext)

  const logout=()=>{
    setToken("")
    localStorage.removeItem('token')
  }

  return (
    <div className='flex items-center justify-between text-sm space-y-[1px] mb-3 border-b border-gray-400 '>
        <img onClick={()=>navigate('/')} className='w-44 cursor-pointer' src = {assets.logo} alt="" />
        <ul className='hidden md:flex items-start gap-5 font-medium'>
          <NavLink to='/'>
            <li className='py-1'>HOME</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
          <NavLink to='/Doctors'>
            <li className='py-1'>ALL DOCTORS</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
          <NavLink to='/About'>
            <li className='py-1'>ABOUT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
          <NavLink to='/Contact'>
            <li className='py-1'>CONTACT</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
          <NavLink to='/E-Pharmacy'>
            <li className='py-1'>E-PHARMACY</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
          <NavLink to='/Laborotory'>
            <li className='py-1'>LABOROTORY</li>
            <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden'/>
          </NavLink>
            
        </ul>
        <div className='flex items-center gap-4'>
          {
            token 
            ? <div className='flex items-center gap-2 cursor-pointer group relative'>
                <img className='w-8 rounded-full' src={assets.profile_pic} alt="" />
                <img className='w-2.5' src={assets.dropdown_icon} alt="" />
                  <div className='absolute top-0 pt-14 text-base font-small text-gray-600 z-20 hidden group-hover:block'>
                    <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                      <p onClick={()=>navigate('MyProfile')} className='hover:text-black cursor-pointer'>My Profile</p>
                      <p onClick={()=>navigate('MyAppointments')} className='hover:text-black cursor-pointer'>My Appointments</p>
                      <p onClick={logout} className='hover:text-black cursor-pointer'>Logout</p>
                    </div>
                  </div>
              </div>
            :<button onClick={()=>navigate('/Login')} className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block'>Create Account</button>
          }
        </div>
    </div>
  )
}

export default Navbar