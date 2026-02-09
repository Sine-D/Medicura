import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const TopDoctors = () => {

    const navigate = useNavigate()
    const { doctors, backendUrl } = useContext(AppContext)


    return (
        <div className='flex flex-col items-center gap-6 my-24 md:mx-10'>
            <h1 className='text-4xl md:text-5xl font-extrabold text-white text-center'>Top <span className='neon-text'>Elite</span> Specialists</h1>
            <p className='sm:w-1/2 text-center text-gray-400 text-lg'>Selected elite specialists available for immediate quantum consultation.</p>

            <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10 px-3 sm:px-0'>
                {doctors.slice(0, 8).map((item, index) => (
                    <div
                        onClick={() => { navigate(`/appointments/${item._id}`); window.scrollTo(0, 0) }}
                        className='glass-card overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-500 flex flex-col'
                        key={item._id || index}
                    >
                        <div className='relative overflow-hidden aspect-square bg-cyber-dark'>
                            <img
                                className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                                src={(item.image || '').toString().trim().startsWith('http') ? item.image : ((item.image || '').toString().trim().startsWith('/uploads') || (item.image || '').toString().trim().startsWith('uploads') ? `${backendUrl}${(item.image || '').toString().trim().startsWith('/') ? '' : '/'}${(item.image || '').toString().trim()}` : item.image)}
                                alt={item.name}
                            />
                        </div>

                        <div className='p-5 flex-1 flex flex-col'>
                            <div className='flex items-center gap-2 text-xs font-bold text-green-400 mb-3 uppercase tracking-tighter'>
                                <span className='w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse'></span>
                                Available Now
                            </div>
                            <p className='text-white text-xl font-bold group-hover:text-neon-cyan transition-colors'>{item.name}</p>
                            <p className='text-neon-purple text-sm font-medium mt-1'>{item.speciality}</p>

                            <div className='mt-auto pt-4'>
                                <div className='w-full h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent mb-4'></div>
                                <button className='w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest group-hover:bg-neon-cyan group-hover:text-black transition-all duration-300'>
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => { navigate('/Doctors'); window.scrollTo(0, 0) }}
                className='neon-button mt-12 px-12 py-4 text-lg'
            >
                View Full Directory
            </button>
        </div>
    )
}

export default TopDoctors