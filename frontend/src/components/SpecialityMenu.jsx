import React from 'react'
import { Link } from 'react-router-dom'
import { specialityData } from '../assets/assets'

const SpecialityMenu = () => {
  console.log('SpecialityMenu rendered, specialityData:', specialityData)

  if (!specialityData || specialityData.length === 0) {
    return (
      <div id='speciality' className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Find by speciality</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simply browse through our specialities and find a doctor that suits your needs.</p>
        </div>
        <div className="text-center text-gray-500">
          <p>Loading specialities...</p>
        </div>
      </div>
    )
  }

  return (
    <div id='speciality' className="py-20">
      <div className="text-center mb-16 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Quantum <span className='neon-text'>Specialities</span></h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">Navigate our specialized medical departments tailored for the next generation of healthcare.</p>
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-neon-purple/5 blur-[80px] rounded-full'></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {specialityData.map((item, index) => (
          <Link key={index} to={`/doctors/${item.speciality.toLowerCase().replace(' ', '-')}`} className="group">
            <div className="glass-card p-6 text-center hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 border-b-2 border-transparent hover:border-neon-cyan shadow-lg">
              <div className='relative mb-4'>
                <div className='absolute inset-0 bg-neon-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity'></div>
                <img src={item.image} alt={item.speciality} className="w-20 h-20 mx-auto relative group-hover:scale-110 transition-transform duration-500 filter brightness-110" />
              </div>
              <p className="font-bold text-gray-300 group-hover:text-neon-cyan transition-colors duration-300 tracking-wide">{item.speciality}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SpecialityMenu