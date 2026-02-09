import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {

    const navigate = useNavigate()

    return (
        <div className='relative overflow-hidden glass-card my-24 md:mx-10 group'>
            {/* Animated Background Pulse */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000'></div>

            <div className='flex flex-col md:flex-row items-center px-8 md:px-16 py-12 md:py-20 relative z-10'>
                {/*---------------leftside-------------- */}
                <div className='flex-1 text-center md:text-left'>
                    <h2 className='text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight'>
                        Secure Your <span className='neon-text'>Quantum</span> <br /> Health Slot
                    </h2>
                    <p className='mt-6 text-gray-400 text-lg max-w-md'>
                        Join 5,000+ pioneers receiving advanced care from our global elite medical network.
                    </p>
                    <button
                        onClick={() => { navigate('/login'); window.scrollTo(0, 0) }}
                        className='neon-button mt-10 px-10 py-4 text-lg'
                    >
                        Register Now
                    </button>
                </div>


                {/*---------------rightside-------------- */}
                <div className='mt-12 md:mt-0 md:w-1/2 flex justify-center'>
                    <div className='relative'>
                        <div className='absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full opacity-50 pulse'></div>
                        <img className='w-64 md:w-80 lg:w-96 relative drop-shadow-[0_0_20px_rgba(0,242,255,0.3)]' src={assets.appointment_img} alt="Future Appointment" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner