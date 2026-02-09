import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className='py-10'>
      {/* Hero Section */}
      <section className="relative overflow-hidden glass-card p-12 md:p-24 text-center mb-16 group">
        <div className='absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-50 pulse'></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6">The <span className='neon-text'>Evolution</span> of Care</h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto text-gray-400 font-medium">Pioneering the next frontier of medical excellence for over 15 years.</p>
        </div>
        <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-neon-cyan/10 blur-[100px] rounded-full'></div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold neon-text inline-block mb-4">Our Genesis</h2>
            <p className='text-justify text-gray-400 text-lg leading-relaxed'>
              Launched in 2008, <span className='text-white font-bold'>MediCura</span> emerged as a beacon of clinical innovation. What began as a community-focused hub has transcended into a global leader in quantum healthcare.
            </p>
            <p className='text-justify text-gray-400 text-lg leading-relaxed'>
              Today, we lead the charge in bio-digital integration, merging advanced AI diagnostics with a deeply human touch. Our mission transcends mere healing—we architect longevity.
            </p>
            <div className='pt-6'>
              <button className='neon-button px-8 py-3'>Explore Our Timeline</button>
            </div>
          </div>
          <div className="flex-1 relative group">
            <div className='absolute -inset-1 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
            <div className="relative glass-card overflow-hidden h-[450px]">
              <img src={assets.story_image} alt="MediCura Genesis" className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="my-20 relative">
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neon-purple/5 blur-[120px] rounded-full'></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          {[
            { title: 'The Mission', text: 'To redefine the boundaries of medical possibility through uncompromising excellence and hyper-personalized care paradigms.' },
            { title: 'The Vision', text: 'To serve as the global standard for the medical renaissance, making elite quantum-grade healthcare a universal reality.' }
          ].map((item, idx) => (
            <div key={idx} className='glass-card p-10 hover:bg-white/5 transition-colors border-t-2 border-t-neon-cyan shadow-neon-glow/10'>
              <h3 className='text-3xl font-bold text-white mb-6 uppercase tracking-widest'>{item.title}</h3>
              <p className='text-gray-400 text-lg leading-relaxed'>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="glass-card py-16 my-20 relative overflow-hidden">
        <div className='absolute inset-0 bg-cyber-dark opacity-40'></div>
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { val: '15+', label: 'Years of Innovation' },
            { val: '24', label: 'Quantum Realms' },
            { val: '50+', label: 'Elite Operators' },
            { val: '10k+', label: 'Pioneers Served' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center group">
              <div className="text-5xl font-black neon-text mb-3 group-hover:scale-110 transition-transform">{stat.val}</div>
              <div className='text-gray-500 font-bold uppercase tracking-tighter text-sm'>{stat.label}</div>
              <div className='mt-4 h-0.5 w-12 bg-neon-cyan/30 mx-auto group-hover:w-20 transition-all'></div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4 uppercase tracking-widest">Core <span className='neon-text'>Architecture</span></h2>
          <p className='text-gray-500'>The foundational principles of our healthcare ecosystem.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {[
            { title: 'Compassion', text: 'Hyper-empathy integrated into every patient interaction.', icon: 'M12.001 4.529c2.349-4.104 12-2.87 12 3.397 0 4.418-5.373 7.86-9.373 11.293a2.998 2.998 0 0 1-3.254 0C5.373 15.786 0 12.344 0 7.926c0-6.267 9.651-7.501 12.001-3.397z' },
            { title: 'Excellence', text: 'Unwavering commitment to the highest standard of quantum care.', icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
            { title: 'Integrity', text: 'Radical transparency in surgical and diagnostic protocols.', icon: 'M12 22s8-4 8-10V5.236a2 2 0 0 0-1.106-1.789l-6-3.272a2 2 0 0 0-1.788 0l-6 3.272A2 2 0 0 0 4 5.236V12c0 6 8 10 8 10z', isStroke: true },
            { title: 'Teamwork', text: 'The collective intelligence of a global medical syndicate.', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
            { title: 'Innovation', text: 'Relentless pursuit of next-gen bio-medical breakthroughs.', icon: 'M12 2a7 7 0 0 1 7 7c0 2.386-1.19 4.5-3 5.74V18a2 2 0 1 1-4 0v-3.26C6.19 13.5 5 11.386 5 9a7 7 0 0 1 7-7z', isStroke: true },
            { title: 'Community', text: 'Uniting humanity through the gift of sustainable health.', icon: 'M16 13c2.67 0 8 1.34 8 4v3H0v-3c0-2.66 5.33-4 8-4h8zm-8-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm8 0c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z' }
          ].map((v, idx) => (
            <div key={idx} className="glass-card p-10 group hover:-translate-y-2 transition-all duration-500 border-b-2 border-transparent hover:border-neon-purple">
              <svg className={`mx-auto mb-6 h-12 w-12 ${v.isStroke ? 'text-neon-purple' : 'fill-neon-purple shadow-neon-purple-glow'}`} fill={v.isStroke ? "none" : "currentColor"} viewBox="0 0 24 24" stroke={v.isStroke ? "currentColor" : "none"}>
                <path d={v.icon} strokeLinecap="round" strokeLinejoin="round" strokeWidth={v.isStroke ? 2 : 0} />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-neon-purple transition-colors">{v.title}</h3>
              <p className='text-gray-500 font-medium'>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4 uppercase tracking-widest">Medical <span className='neon-text'>Council</span></h2>
          <p className='text-gray-500 font-medium'>The masterminds behind our clinical breakthroughs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: 'Dr. Sarah Johnson', role: 'Medical Director', exp: 'Quantum Leadership Strategist', img: assets.leadership1 },
            { name: 'Dr. Michael Chen', role: 'Chief of Surgery', exp: 'Nanobot Surgical Specialist', img: assets.leadership2 },
            { name: 'Dr. Emily Rodriguez', role: 'Head of Pediatrics', exp: 'Genetic Development Expert', img: assets.leadership3 },
            { name: 'Robert Williams', role: 'Admin Director', exp: 'Biosystem Operations Architect', img: assets.leadership4 }
          ].map((leader, idx) => (
            <div key={idx} className="glass-card overflow-hidden group hover:shadow-neon-glow/20 transition-shadow">
              <div className="h-72 overflow-hidden bg-cyber-dark grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={leader.img} alt={leader.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6 relative">
                <div className='absolute -top-10 right-6 w-12 h-12 glass-card flex items-center justify-center text-neon-cyan shadow-neon-glow'>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{leader.name}</h3>
                <p className="text-neon-cyan text-sm font-bold uppercase tracking-widest mb-3">{leader.role}</p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{leader.exp}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;