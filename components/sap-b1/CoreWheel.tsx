import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const CoreWheel: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.core;
  const coreModules = section.modules;
  const [activeCore, setActiveCore] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCore((prev) => (prev + 1) % coreModules.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-24 bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center mb-16">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">{section.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {section.description}
        </p>
      </div>

      <div className="relative w-[600px] h-[600px] mx-auto hidden lg:block">
        {/* Center Core */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sap-blue rounded-full flex flex-col items-center justify-center z-20 shadow-[0_0_50px_rgba(0,143,211,0.3)] border-4 border-white/20">
          <span className="text-white font-bold text-2xl tracking-tight">{section.centerTitle}</span>
          <span className="text-white/80 font-medium text-sm">{section.centerSubtitle}</span>
          <div className="mt-2 px-3 py-1 bg-white/20 rounded-full text-[10px] text-white font-bold uppercase tracking-widest">{section.centerBadge}</div>
        </div>

        {/* Orbiting Modules */}
        {coreModules.map((module, idx) => {
          const angle = (idx * 360) / coreModules.length;
          const radius = 240;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);
          const isActive = activeCore === idx;
          const Icon = resolveIcon(module.icon);

          return (
            <div 
              key={idx}
              className={`absolute top-1/2 left-1/2 w-32 h-32 -ml-16 -mt-16 flex flex-col items-center justify-center transition-all duration-700 cursor-pointer ${isActive ? 'scale-125 z-10' : 'scale-90 opacity-40 hover:opacity-100'}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => setActiveCore(idx)}
            >
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center mb-2 shadow-xl transition-all duration-500 ${isActive ? 'bg-white border-sap-blue text-sap-blue rotate-[360deg]' : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-500'}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className={`text-center text-[10px] font-bold uppercase tracking-wider w-32 leading-tight transition-colors ${isActive ? 'text-sap-blue' : 'text-slate-500 dark:text-slate-400'}`}>
                {module.name}
              </div>
            </div>
          );
        })}
        
        {/* Connecting Lines Ring */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-10">
          <circle cx="300" cy="300" r="240" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 4" className="text-sap-blue" />
        </svg>
      </div>
      
      {/* Mobile List View for Core */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-4 gap-4 px-6">
        {coreModules.map((m, i) => {
          const Icon = resolveIcon(m.icon);
          return (
            <div key={i} className="p-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-white/10 text-center shadow-sm">
              <div className="text-sap-blue mb-3 flex justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-white leading-tight">{m.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoreWheel;
