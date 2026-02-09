import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (

    <div className='mt-20'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='glass-card p-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 text-sm'>
          <div className='flex flex-col items-center md:items-start'>
            <img src={assets.logo} alt="MediCura" className='w-44 mb-6 hover:drop-shadow-neon-glow transition-all' />
            <p className='text-gray-400 leading-relaxed text-center md:text-left'>
              Empowering your health with futuristic care. Browse trusted doctors and schedule appointments with a single click.
            </p>
          </div>
          <div>
            <p className='text-neon-cyan font-bold mb-6 text-lg tracking-wider'>COMPANY</p>
            <ul className='space-y-3 text-gray-400'>
              <li className='hover:text-white transition-colors cursor-pointer flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-glow'></span> Home
              </li>
              <li className='hover:text-white transition-colors cursor-pointer flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-glow'></span> About us
              </li>
              <li className='hover:text-white transition-colors cursor-pointer flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-glow'></span> Contact us
              </li>
              <li className='hover:text-white transition-colors cursor-pointer flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon-glow'></span> Privacy policy
              </li>
            </ul>
          </div>
          <div>
            <p className='text-neon-purple font-bold mb-6 text-lg tracking-wider'>GET IN TOUCH</p>
            <ul className='space-y-3 text-gray-400'>
              <li className='flex items-center gap-2'>
                <i className="fas fa-phone text-neon-purple"></i> +94 703287271
              </li>
              <li className='flex items-center gap-2'>
                <i className="fas fa-envelope text-neon-purple"></i> info@medicura.com
              </li>
            </ul>
          </div>
        </div>

        <div className='py-8 text-center text-gray-500 text-xs tracking-widest uppercase'>
          <p>Copyright © 2025 MediCura. Designed for the Future.</p>
        </div>
      </div>
    </div>
  )
}

export default Footer