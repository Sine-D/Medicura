import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'

const SupplierDashboard = () => {
    const { aToken, setAToken } = useContext(AdminContext)

    const handleLogout = () => {
        localStorage.removeItem('aToken')
        localStorage.removeItem('userInfo')
        setAToken('')
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

    return (
        <div className='min-h-screen bg-gray-100'>
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center py-4'>
                        <h1 className='text-2xl font-bold text-gray-900'>Supplier Dashboard</h1>
                        <div className='flex items-center space-x-4'>
                            <span className='text-sm text-gray-600'>Welcome, {userInfo.name}!</span>
                            <button 
                                onClick={handleLogout}
                                className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
                <div className='px-4 py-6 sm:px-0'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        <div className='bg-white overflow-hidden shadow rounded-lg'>
                            <div className='p-5'>
                                <div className='flex items-center'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center'>
                                            <span className='text-white font-bold'>📦</span>
                                        </div>
                                    </div>
                                    <div className='ml-5 w-0 flex-1'>
                                        <dl>
                                            <dt className='text-sm font-medium text-gray-500 truncate'>Active Orders</dt>
                                            <dd className='text-lg font-medium text-gray-900'>8</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white overflow-hidden shadow rounded-lg'>
                            <div className='p-5'>
                                <div className='flex items-center'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-8 h-8 bg-green-500 rounded-md flex items-center justify-center'>
                                            <span className='text-white font-bold'>✅</span>
                                        </div>
                                    </div>
                                    <div className='ml-5 w-0 flex-1'>
                                        <dl>
                                            <dt className='text-sm font-medium text-gray-500 truncate'>Delivered Today</dt>
                                            <dd className='text-lg font-medium text-gray-900'>12</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white overflow-hidden shadow rounded-lg'>
                            <div className='p-5'>
                                <div className='flex items-center'>
                                    <div className='flex-shrink-0'>
                                        <div className='w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center'>
                                            <span className='text-white font-bold'>💰</span>
                                        </div>
                                    </div>
                                    <div className='ml-5 w-0 flex-1'>
                                        <dl>
                                            <dt className='text-sm font-medium text-gray-500 truncate'>Today's Revenue</dt>
                                            <dd className='text-lg font-medium text-gray-900'>$3,200</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-8'>
                        <div className='bg-white shadow rounded-lg'>
                            <div className='px-4 py-5 sm:p-6'>
                                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>Recent Orders</h3>
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                                        <div>
                                            <p className='font-medium'>Medical Supplies - Order #SUP001</p>
                                            <p className='text-sm text-gray-500'>Ordered at 8:30 AM - $450</p>
                                        </div>
                                        <span className='px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full'>Delivered</span>
                                    </div>
                                    <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                                        <div>
                                            <p className='font-medium'>Lab Equipment - Order #SUP002</p>
                                            <p className='text-sm text-gray-500'>Ordered at 11:45 AM - $1,200</p>
                                        </div>
                                        <span className='px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full'>In Transit</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SupplierDashboard
