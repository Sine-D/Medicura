import React from 'react'
import { assets } from '../assets/assets'

const Header = () => {
    return (
        <div className='relative overflow-hidden glass-card p-6 md:p-12 lg:p-20 flex flex-col md:flex-row items-center gap-10'>
            {/* Futuristic Background Accents */}
            <div className='absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[120px] rounded-full'></div>
            <div className='absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/10 blur-[120px] rounded-full'></div>

            {/*-------------left side----------------*/}
            <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 z-10'>
                <p className='text-4xl md:text-5xl lg:text-6xl text-white font-extrabold leading-tight'>
                    Experience <br /> <span className='neon-text'>Futuristic</span> Healthcare
                </p>
                <div className='flex flex-col sm:flex-row items-center gap-4 text-gray-400 text-base font-medium'  >
                    <img className='w-28 filter brightness-125' src={assets.group_profiles} alt="" />
                    <p>
                        Connect with top-tier specialists through <br className='hidden sm:block' /> our advanced AI-driven medical network.
                    </p>
                </div>
                <a href="#speciality" className='neon-button flex items-center gap-2 group'>
                    Book Appointment
                    <img className='w-4 group-hover:translate-x-1 transition-transform invert' src={assets.arrow_icon} alt="" />
                </a>
            </div>

            {/*-------------right side----------------*/}
            <div className='md:w-1/2 relative z-10'>
                <div className='relative group'>
                    <div className='absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity'></div>
                    <img className='w-full h-auto rounded-2xl relative border border-white/10 shadow-2xl' src={assets.header_img} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Header