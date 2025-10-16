import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    
    <div className='max-w-6xl mx-auto px-4'>
      
      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 pt-16 pb-10 text-sm justify-items-center'>
        <div className='text-center'>
            <div className='flex items-center justify-center gap-3'>
              
              <img src={assets.logo} alt="MediCura" className='w-36 md:w-40' />
            </div>
            <p className='text-gray-600 leading-6 mt-4'>Simply browse through our extensive list of trusted doctors and schedule your appointment hassle-free.</p>
        </div>
        <div className='mt-4 md:mt-20 text-left'>
            <p className='text-gray-800 font-semibold mb-4'>COMPANY</p>
              <ul className='space-y-2 text-gray-600'>
                <li className='hover:text-black cursor-pointer'>Home</li>
                <li className='hover:text-black cursor-pointer'>About us</li>
                <li className='hover:text-black cursor-pointer'>Contact us</li>
                <li className='hover:text-black cursor-pointer'>Privacy policy</li>
              </ul>
        </div>
        <div className='mt-4 md:mt-20 text-left'>
           <p className='text-gray-800 font-semibold mb-4'>GET IN TOUCH</p>
            <ul className='space-y-2 text-gray-600'>
              <li>+94 703287271</li>
              <li>info@medicare.com</li>
            </ul>
        </div>

      </div> 

      <div className='border-t border-gray-200 py-6 text-center'>
        <p className='text-gray-500 text-sm'>Copyright © 2025 MediCura. All rights reserved.</p>
      </div>

    </div>
  )
}

export default Footer