import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {

    const {aToken} = useContext(AdminContext)

return(
    <div className='min-h-screen bg-white border-r shadow-lg'>
        {
            aToken && (
              <>
                <div className='p-6 border-b border-gray-200'>
                  <h2 className='text-lg font-semibold text-gray-800'>Admin Panel</h2>
                  <p className='text-sm text-gray-500'>MediCura Management</p>
                </div>
                <ul className='text-[#515151] mt-5'>
                <li>
                    <NavLink  
                        className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to ={'/admin-dashboard'}>
                        <img src={assets.home_icon} alt="" className='w-5 h-5' />
                        <p>Dashboard</p>
                    </NavLink>
                </li>

                
                
                <li>
                    <NavLink 
                        className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to ={'/add-doctor'}>
                        <img src={assets.add_icon} alt="" className='w-5 h-5' />
                        <p>Add Doctor</p>
                    </NavLink>
                </li>

                
                <li>
                    <NavLink  
                        className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to ={'/contacts'}>
                        <img src={assets.list_icon} alt="Contact Messages" className='w-5 h-5' />
                        <p>Contact Messages</p>
                    </NavLink>
                </li>

                <li>
                    <NavLink  
                        className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : ''}`} to ={'/reports'}>
                        <img src={assets.appointments_icon} alt="Reports" className='w-5 h-5' />
                        <p>Reports</p>
                    </NavLink>
                </li>
                </ul>
              </>
            )
        }
    </div>
 )
}

export default Sidebar