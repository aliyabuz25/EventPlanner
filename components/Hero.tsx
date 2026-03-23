
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const Hero: React.FC = () => {
  const { content } = useSiteContent();
  const hero = content.pages.home.sections.hero;
  const heroVisual = hero.visual;

  return (
    <div id="home" className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-sap-paper dark:bg-gradient-to-b dark:from-[#0a0a0a] dark:via-[#050505] dark:to-[#000000] transition-colors duration-500">
      {/* SAP-style ambient gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sap-blue/10 dark:bg-sap-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sap-gold/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/4 transition-colors duration-500"></div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10 w-full">
        {/* Text Side */}
        <div className="text-left relative z-40">
          <div className="flex items-center space-x-3 mb-8 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 w-fit px-4 py-2 rounded-md backdrop-blur-sm shadow-sm dark:shadow-none transition-all">
            <span className="w-2 h-2 bg-sap-gold rounded-full shadow-[0_0_10px_#F0AB00]"></span>
            <span className="text-slate-800 dark:text-white text-xs font-bold tracking-wider uppercase">
              {hero.badge}
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-8 text-slate-900 dark:text-white transition-colors">
            {hero.title.lineOne} <br />
            <span className="text-sap-blue">{hero.title.highlight}</span> <br />
            <span className="text-slate-500 dark:text-white font-light dark:font-light">{hero.title.lineThree}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-lg leading-relaxed font-normal border-l-4 border-sap-gold pl-6 transition-colors">
            {hero.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-16">
            <a href={hero.primaryHref} className="px-8 py-3.5 bg-sap-blue hover:bg-[#007db8] text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 flex items-center space-x-2">
              <span>{hero.primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href={hero.secondaryHref} className="px-8 py-3.5 bg-white dark:bg-transparent border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded-lg font-medium transition-all shadow-sm dark:shadow-none">
              {hero.secondaryCta}
            </a>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center space-x-12 border-t border-slate-200 dark:border-white/10 pt-8 transition-colors">
             {hero.stats.map((stat) => (
               <div key={stat.label}>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">{stat.label}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Media Side - 3D Floating Glass Dashboard Composition */}
        <div className="relative mt-12 lg:mt-0 flex justify-center lg:justify-end [perspective:2000px] group/scene">
           <div className="relative w-full max-w-[650px] h-[500px] [transform-style:preserve-3d] [transform:rotateY(-12deg)_rotateX(5deg)] group-hover/scene:[transform:rotateY(-5deg)_rotateX(2deg)] transition-transform duration-700 ease-out">
              
              {/* Back Card (Right side panel - Report & Graphics) */}
              <div className="group/card absolute right-0 top-[-20px] w-[260px] h-[460px] bg-slate-200/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl shadow-2xl [transform:translateZ(-40px)] flex flex-col overflow-hidden">
                 
                 {/* Shine Effect (Light Refraction) - Improved Softness to remove artifacts */}
                 <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-xl">
                    <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent skew-x-[-15deg] blur-md transition-transform duration-[2000ms] ease-in-out group-hover/scene:translate-x-[200%]"></div>
                 </div>

                 {heroVisual.sideImageUrl ? (
                   <img
                     src={heroVisual.sideImageUrl}
                     alt={heroVisual.sideImageAlt || 'Analytics panel preview'}
                     className="w-full h-full object-cover"
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                   <>
                     {/* Header */}
                     <div className="h-10 bg-[#008FD3]/20 border-b border-white/10 flex items-center px-4 justify-between">
                        <div className="text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-wider">Reports & Analytics</div>
                        <div className="w-2 h-2 rounded-full bg-[#F0AB00]"></div>
                     </div>
                     {/* Content */}
                     <div className="p-4 space-y-4 flex-1">
                        <div className="bg-white/40 dark:bg-white/5 rounded p-3 h-32 relative border border-white/20">
                           <div className="text-[9px] text-slate-600 dark:text-slate-400 mb-2 font-semibold">Sales Forecast</div>
                           <div className="flex items-end space-x-2 h-20 px-2 pb-2 border-b border-slate-300 dark:border-white/10">
                              <div className="w-1/4 bg-[#008FD3] h-[40%] rounded-t-sm opacity-80"></div>
                              <div className="w-1/4 bg-[#008FD3] h-[70%] rounded-t-sm opacity-90"></div>
                              <div className="w-1/4 bg-[#F0AB00] h-[50%] rounded-t-sm"></div>
                              <div className="w-1/4 bg-[#008FD3] h-[90%] rounded-t-sm"></div>
                           </div>
                        </div>
                        <div className="bg-white/40 dark:bg-white/5 rounded p-3 h-32 border border-white/20 flex flex-col justify-center">
                           <div className="text-[9px] text-slate-600 dark:text-slate-400 mb-2 font-semibold">Efficiency Metric</div>
                           <div className="flex justify-center items-center h-16">
                              <div className="relative w-16 h-16 rounded-full border-4 border-slate-200 dark:border-white/10">
                                  <div className="absolute inset-0 rounded-full border-4 border-[#F0AB00] border-t-transparent border-l-transparent rotate-[-45deg]"></div>
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-white">85%</div>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-2">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-2 w-full bg-white/30 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-400 dark:bg-slate-600" style={{width: `${80 - (i*15)}%`}}></div>
                                </div>
                            ))}
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* Main Card (Front/Left - ERP Dashboard) */}
              <div className="absolute left-0 top-[40px] w-[460px] h-[360px] bg-white/60 dark:bg-[#0e1621]/90 backdrop-blur-2xl border border-white/40 dark:border-white/20 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden [transform:translateZ(40px)]">
                 {heroVisual.mainImageUrl ? (
                   <img
                     src={heroVisual.mainImageUrl}
                     alt={heroVisual.mainImageAlt || 'ERP dashboard preview'}
                     className="w-full h-full object-cover"
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                   <>
                     <div className="h-12 bg-white/40 dark:bg-white/5 border-b border-white/20 dark:border-white/10 flex items-center px-4 justify-between">
                        <div className="flex space-x-2">
                           <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
                           <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
                           <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
                        </div>
                        <div className="text-xs font-bold text-slate-700 dark:text-white/90 tracking-wide">ERP Dashboard</div>
                        <div className="w-4"></div>
                     </div>

                     <div className="p-6 grid grid-cols-2 gap-4 flex-1">
                        <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 border border-white/30 dark:border-white/5 shadow-sm">
                           <div className="flex justify-between items-start mb-3">
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">Revenue</div>
                              <div className="text-[#008FD3] text-[10px] font-bold bg-[#008FD3]/10 px-1.5 py-0.5 rounded">+24%</div>
                           </div>
                           <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">$1.2M</div>
                           <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#008FD3] h-full w-[70%] rounded-full"></div>
                           </div>
                        </div>

                        <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 border border-white/30 dark:border-white/5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">Active Users</div>
                              <div className="text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</div>
                           </div>
                           <div className="flex items-end space-x-1.5 mt-2 h-8">
                              {[40, 60, 45, 90, 70, 85].map((h, i) => (
                                  <div key={i} className={`flex-1 rounded-sm ${i === 3 ? 'bg-[#F0AB00]' : 'bg-slate-300 dark:bg-slate-600'}`} style={{height: `${h}%`}}></div>
                              ))}
                           </div>
                        </div>

                        <div className="col-span-2 bg-white/50 dark:bg-white/5 rounded-lg p-4 border border-white/30 dark:border-white/5 shadow-sm flex flex-col relative overflow-hidden">
                           <div className="flex justify-between items-center mb-2">
                               <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">System Load</div>
                               <div className="flex space-x-1">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                               </div>
                           </div>
                           <div className="relative h-16 w-full mt-2">
                              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                                  <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="0.5" />
                                  <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="0.5" />
                                  <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="0.5" />
                                  <path d="M0 30 C 10 25, 20 35, 30 20 S 50 5, 60 15 S 80 25, 100 10" fill="none" stroke="#008FD3" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M0 30 C 10 25, 20 35, 30 20 S 50 5, 60 15 S 80 25, 100 10 V 40 H 0 Z" fill="url(#gradient)" opacity="0.15" />
                                  <defs>
                                     <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#008FD3" />
                                        <stop offset="100%" stopColor="transparent" />
                                     </linearGradient>
                                  </defs>
                              </svg>
                              <div className="absolute top-[25%] left-[60%] w-3 h-3 bg-white dark:bg-[#0e1621] rounded-full border-2 border-[#008FD3] shadow-md transform -translate-x-1/2 -translate-y-1/2 z-10"></div>
                              <div className="absolute top-[5%] left-[60%] transform -translate-x-1/2 -translate-y-full bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                 Peak
                              </div>
                           </div>
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* Decorative elements behind cards - CHANGED TO NEUTRAL/GRAY */}
              <div className="absolute top-[10px] left-[40px] w-24 h-24 bg-sap-blue/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[20px] right-[40px] w-40 h-40 bg-sap-gold/10 rounded-full blur-3xl pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
