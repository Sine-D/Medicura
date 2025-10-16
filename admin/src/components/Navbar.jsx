import React, { useContext, useState, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import { assets } from '../assets/assets'

const Navbar = () => {
    const {aToken, setAToken} = useContext(AdminContext)
    const [isHovering, setIsHovering] = useState(false)
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('aToken')
        localStorage.removeItem('userInfo')
        setAToken('')
    }

    const getUserInfo = () => {
        try {
            return JSON.parse(localStorage.getItem('userInfo') || '{}')
        } catch {
            return {}
        }
    }

    const getDashboardConfig = () => {
        if (!aToken) return { title: 'Login Portal', icon: '🔐', color: 'from-slate-600 to-slate-800' }
        
        const userInfo = getUserInfo()
        const userType = userInfo.userType

        const configs = {
            admin: { 
                title: 'Admin Dashboard', 
                icon: '👑', 
                color: 'from-purple-600 via-pink-600 to-red-600',
                subtitle: 'System Administrator'
            },
            doctor: { 
                title: 'Doctor Dashboard', 
                icon: '⚕️', 
                color: 'from-blue-600 via-cyan-600 to-teal-600',
                subtitle: 'Medical Professional'
            },
            labAssistant: { 
                title: 'Lab Assistant', 
                icon: '🔬', 
                color: 'from-green-600 via-emerald-600 to-teal-600',
                subtitle: 'Laboratory Services'
            },
            supplier: { 
                title: 'Supplier Portal', 
                icon: '📦', 
                color: 'from-orange-600 via-amber-600 to-yellow-600',
                subtitle: 'Supply Management'
            },
            inventoryManager: { 
                title: 'Inventory Manager', 
                icon: '📊', 
                color: 'from-indigo-600 via-purple-600 to-pink-600',
                subtitle: 'Stock Control'
            },
            accountant: { 
                title: 'Accountant Portal', 
                icon: '💰', 
                color: 'from-emerald-600 via-green-600 to-lime-600',
                subtitle: 'Financial Management'
            }
        }

        return configs[userType] || configs.admin
    }

    const config = getDashboardConfig()
    const userInfo = getUserInfo()

    return (
        <div className='relative overflow-hidden min-h-[100px]'>
            {/* Animated gradient background with mesh pattern */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.color}`}>
                <div className='absolute inset-0 opacity-10'>
                    <div className='absolute inset-0' style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>
            </div>

            {/* Floating orbs animation */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float'></div>
                <div className='absolute bottom-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float-delayed'></div>
                <div className='absolute top-1/2 left-1/2 w-36 h-36 bg-white/5 rounded-full blur-3xl animate-float-slow'></div>
            </div>
            
            {/* Main navbar content */}
            <div className='relative backdrop-blur-md bg-white/5 border-b-2 border-white/20 shadow-2xl'>
                <div className='px-8 py-5'>
                    <div className='flex justify-between items-center'>
                        {/* Left section with logo and title */}
                        <div className='flex items-center space-x-6'>
                            {/* 3D Logo container with perspective */}
                            <div className='relative group perspective-1000'>
                                {/* Glow effect layers */}
                                <div className='absolute -inset-4 bg-gradient-to-r from-white/40 via-white/20 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 animate-pulse-slow'></div>
                                <div className='absolute -inset-2 bg-gradient-to-br from-white/30 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500'></div>
                                
                                {/* Logo card with 3D transform */}
                                <div className='relative bg-white/20 backdrop-blur-xl p-4 rounded-2xl border-2 border-white/40 shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-y-12 preserve-3d group-hover:shadow-white/50'>
                                    <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl'></div>
                                    <img 
                                        src={assets.admin_logo} 
                                        alt="Medicura Logo" 
                                        className='h-14 w-14 object-contain relative z-10 drop-shadow-2xl'
                                    />
                                    {/* Shine effect */}
                                    <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full'></div>
                                </div>
                            </div>

                            {/* Title section with animated elements */}
                            <div className='flex items-center space-x-4'>
                                {/* Icon with 3D effect */}
                                <div className='relative'>
                                    <div className='absolute inset-0 blur-xl bg-white/50 rounded-full'></div>
                                    <span className='relative text-5xl filter drop-shadow-2xl transform transition-all duration-500 hover:scale-125 hover:rotate-12 inline-block animate-bounce-subtle'>
                                        {config.icon}
                                    </span>
                                </div>

                                {/* Text content */}
                                <div className='space-y-1'>
                                    <div className='flex items-center space-x-3'>
                                        <h1 className='text-3xl font-black text-white drop-shadow-2xl tracking-tight bg-clip-text'>
                                            {config.title}
                                        </h1>
                                        {aToken && (
                                            <span className='px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white border border-white/30 shadow-lg'>
                                                MEDICURA
                                            </span>
                                        )}
                                    </div>
                                    {aToken && (
                                        <div className='flex items-center space-x-3'>
                                            <p className='text-sm font-medium text-white/90 drop-shadow-lg'>
                                                {config.subtitle}
                                            </p>
                                            <span className='text-xs text-white/70'>•</span>
                                            <p className='text-xs font-medium text-white/80'>
                                                {userInfo.email || 'user@medicura.com'}
                                            </p>
                                        </div>
                                    )}
                                    {/* Animated underline */}
                                    <div className='h-1 bg-gradient-to-r from-white via-white/80 to-transparent rounded-full transform transition-all duration-700 shadow-lg shadow-white/50'></div>
                                </div>
                            </div>
                        </div>

                        {/* Right section with time and logout */}
                        <div className='flex items-center space-x-6'>
                            {/* Live clock */}
                            {aToken && (
                                <div className='hidden md:flex flex-col items-end space-y-1 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl'>
                                    <div className='flex items-center space-x-2'>
                                        <span className='text-xs font-semibold text-white/70 uppercase tracking-wider'>Live</span>
                                        <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50'></div>
                                    </div>
                                    <p className='text-xl font-bold text-white tabular-nums drop-shadow-lg'>
                                        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                    <p className='text-xs text-white/70 font-medium'>
                                        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            )}

                            {/* Logout button */}
                            {aToken && (
                                <div className='relative group'>
                                    {/* Multi-layer glow effect */}
                                    <div className='absolute -inset-2 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-300 animate-pulse-glow'></div>
                                    <div className='absolute -inset-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-all duration-300'></div>
                                    
                                    <button 
                                        onClick={handleLogout}
                                        onMouseEnter={() => setIsHovering(true)}
                                        onMouseLeave={() => setIsHovering(false)}
                                        className='relative bg-gradient-to-r from-red-600 via-red-500 to-pink-600 hover:from-red-700 hover:via-red-600 hover:to-pink-700 text-white px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-2xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-95 border-2 border-white/40 backdrop-blur-sm overflow-hidden group'
                                    >
                                        {/* Shine effect on hover */}
                                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
                                        
                                        <span className='relative flex items-center space-x-3'>
                                            <span className={`text-xl transition-all duration-500 ${isHovering ? 'rotate-180 scale-125' : ''}`}>
                                                🚪
                                            </span>
                                            <span className='drop-shadow-lg'>Logout</span>
                                            <svg className={`w-4 h-4 transition-all duration-300 ${isHovering ? 'translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom decorative elements */}
                <div className='relative h-1 overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer'></div>
                    <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/50 to-white/0 blur-sm'></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(-20px) translateX(10px); }
                    50% { transform: translateY(-10px) translateX(-10px); }
                    75% { transform: translateY(-15px) translateX(5px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    25% { transform: translateY(15px) translateX(-10px); }
                    50% { transform: translateY(20px) translateX(10px); }
                    75% { transform: translateY(10px) translateX(-5px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.1); }
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-slow 12s ease-in-out infinite;
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .rotate-y-12:hover {
                    transform: rotateY(12deg);
                }
            `}</style>
        </div>
    )
}

export default Navbar