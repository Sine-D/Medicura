import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LabAppointmentForm from '../components/LabAppointmentForm';

const Laboratory = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleAIAssistant = () => {
    navigate('/ai-lab-assistant');
  };

  return (
    <div className='py-12 px-4 max-w-7xl mx-auto'>
      {/* Futuristic Hero Section */}
      <div className="glass-card border-white/5 p-12 md:p-20 relative overflow-hidden group/lab">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] group-hover/lab:bg-neon-purple/20 transition-colors duration-1000"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-cyan/5 rounded-full blur-[100px]"></div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          <div className='inline-flex items-center gap-3 px-4 py-1.5 glass-card border-neon-purple/30 bg-neon-purple/5 mb-4'>
            <span className='w-2 h-2 bg-neon-purple rounded-full shadow-neon-purple-glow animate-pulse'></span>
            <span className='text-[10px] font-black text-neon-purple uppercase tracking-[0.3em]'>Diagnostic Intelligence Node</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
            Precision <span className='neon-text-purple'>Biometrics</span> & Diagnostics
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
            High-fidelity analysis through decentralized medical compute. Real-time laboratory results with cryptographic verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button
              onClick={() => setIsFormOpen(true)}
              className="neon-button-purple px-10 py-4 text-xs group/btn"
            >
              <span className='group-hover/btn:translate-x-1 transition-transform inline-block'>Initialize Diagnostic Synch</span>
            </button>
            <button
              onClick={handleAIAssistant}
              className="glass-card px-10 py-4 text-xs font-black text-white uppercase tracking-widest border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
            >
              Analyze Biomarkers (AI)
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {[
          { label: 'Latency', value: '24-48h', sub: 'Result Synch' },
          { label: 'Processing', value: '200+', sub: 'Active Modules' },
          { label: 'Precision', value: '99.9%', sub: 'Fidelity Rate' },
          { label: 'Throughput', value: '5K+', sub: 'Monthly SAMPLES' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-8 border-white/5 hover:border-white/20 transition-all text-center group/stat">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 group-hover/stat:text-neon-purple transition-colors">{stat.label}</div>
            <div className="text-3xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Laboratory Modules section */}
      <div className="py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Diagnostic <span className='neon-text-purple'>Modules</span></h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3">Integrated Biosensor Array Solutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Nucleic Synthesis', desc: 'Advanced DNA sequencing and mutation analysis for predictive medical intervention.', icon: 'dna' },
            { title: 'Cytologic Array', desc: 'High-resolution tissue scanning and cellular pathology via neural compute.', icon: 'pathology' },
            { title: 'Hematologic Synch', desc: 'Real-time metabolic profiles and biometric blood analysis with zero latency sync.', icon: 'blood' }
          ].map((mod, i) => (
            <div key={i} className="glass-card p-10 border-white/5 hover:border-neon-purple/20 transition-all group/mod relative overflow-hidden">
              <div className='absolute -top-12 -right-12 w-24 h-24 bg-neon-purple/5 rounded-full blur-xl group-hover/mod:bg-neon-purple/10 transition-colors'></div>
              <div className='w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-neon-purple group-hover/mod:scale-110 transition-transform'>
                {mod.icon === 'dna' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2L3 9l9 7 9-7-9-7zm0 16l-9-7 9 7 9-7-9 7z" /></svg>}
                {mod.icon === 'pathology' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>}
                {mod.icon === 'blood' && <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l-1.5 1.5L2 12l10 10 10-10-8.5-8.5L12 2zm0 2.8l7.5 7.5H4.5L12 4.8z" /></svg>}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover/mod:text-neon-purple transition-colors">{mod.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Contact Metadata Section */}
      <div className="glass-card bg-cyber-dark/30 border-white/5 p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-neon-purple/5 blur-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
          <div>
            <h3 className="text-neon-purple text-xs font-black uppercase tracking-[0.3em] mb-6">Nexus Repository</h3>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              MediCura Laboratory has been the primary diagnostic authority for 15+ years. Operating within the secure medical mesh.
            </p>
          </div>

          <div>
            <h3 className="text-neon-purple text-xs font-black uppercase tracking-[0.3em] mb-6">Comms Protocol</h3>
            <div className="space-y-4">
              {[
                { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text: '123 Medical Drive, Health City' },
                { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text: '045-1234567 -LABS' },
                { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: 'labs@medicura.crypto' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  <svg className="w-5 h-5 text-gray-700 group-hover/item:text-neon-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-neon-purple text-xs font-black uppercase tracking-[0.3em] mb-6">Active Uptime</h3>
            <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <div className='flex justify-between border-b border-white/5 pb-2'><span>Weekdays:</span> <span className='text-white'>0700 - 2100</span></div>
              <div className='flex justify-between border-b border-white/5 pb-2'><span>Saturday:</span> <span className='text-white'>0700 - 1700</span></div>
              <div className='flex justify-between'><span>Sunday:</span> <span className='text-neon-purple'>8A - 2P</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-700 text-[8px] font-black uppercase tracking-[0.5em]">
          Copyright © 2050 MediCura Medical Command. All rights reserved.
        </p>
      </div>

      <LabAppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default Laboratory;
