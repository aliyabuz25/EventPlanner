
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const Hero: React.FC = () => {
  const { content } = useSiteContent();
  const hero = content.pages.home.sections.hero;
  const heroVisual = hero.visual;

  return (
    <div id="home" className="relative flex items-center pt-24 pb-16 sm:pb-20 lg:min-h-screen overflow-hidden bg-sap-paper dark:bg-gradient-to-b dark:from-[#0a0a0a] dark:via-[#050505] dark:to-[#000000] transition-colors duration-500">
      {/* SAP-style ambient gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sap-blue/10 dark:bg-sap-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sap-gold/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/4 transition-colors duration-500"></div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-10 lg:gap-24 items-center relative z-10 w-full">
        {/* Text Side */}
        <div className="text-left relative z-40">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 w-fit px-3 sm:px-4 py-2 rounded-md backdrop-blur-sm shadow-sm dark:shadow-none transition-all">
            <span className="w-2 h-2 bg-sap-gold rounded-full shadow-[0_0_10px_#F0AB00]"></span>
            <span className="text-slate-800 dark:text-white text-xs font-bold tracking-wider uppercase">
              {hero.badge}
            </span>
          </div>
          
          <h1 className="text-[2.8rem] sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 sm:mb-8 text-slate-900 dark:text-white transition-colors">
            {hero.title.lineOne} <br />
            <span className="text-sap-blue">{hero.title.highlight}</span> <br />
            <span className="text-slate-500 dark:text-white font-light dark:font-light">{hero.title.lineThree}</span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 max-w-xl leading-relaxed font-normal border-l-4 border-sap-gold pl-4 sm:pl-6 transition-colors">
            {hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-16">
            <a href={hero.primaryHref} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-sap-blue hover:bg-[#007db8] text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 flex items-center justify-center space-x-2">
              <span>{hero.primaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href={hero.secondaryHref} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-white dark:bg-transparent border border-slate-200 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded-lg font-medium transition-all shadow-sm dark:shadow-none text-center">
              {hero.secondaryCta}
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 sm:gap-10 border-t border-slate-200 dark:border-white/10 pt-6 sm:pt-8 transition-colors">
             {hero.stats.map((stat) => (
               <div key={stat.label}>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">{stat.label}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Media Side - 3D Floating Glass Dashboard Composition */}
        <div className="relative mt-4 sm:mt-8 lg:mt-0 flex justify-center lg:justify-end [perspective:2000px] group/scene">
           <div className="relative w-full max-w-[340px] sm:max-w-[520px] lg:max-w-[650px] h-[320px] sm:h-[420px] lg:h-[500px] [transform-style:preserve-3d] sm:[transform:rotateY(-12deg)_rotateX(5deg)] group-hover/scene:sm:[transform:rotateY(-5deg)_rotateX(2deg)] transition-transform duration-700 ease-out">
              
              {/* Back Card (Right side panel - Event Operations Snapshot) */}
              <div className="group/card absolute right-0 top-0 sm:top-[-20px] w-[170px] sm:w-[220px] lg:w-[260px] h-[290px] sm:h-[380px] lg:h-[460px] bg-slate-200/40 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl shadow-2xl sm:[transform:translateZ(-40px)] flex flex-col overflow-hidden">
                 
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
                     <div className="h-10 bg-[#008FD3]/20 border-b border-white/10 flex items-center px-4 justify-between">
                        <div className="text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-wider">Live Event Desk</div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <div className="text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">On Site</div>
                        </div>
                     </div>
                     <div className="p-4 space-y-4 flex-1">
                        <div className="rounded-xl border border-white/20 bg-white/45 dark:bg-white/[0.04] p-3">
                           <div className="flex items-center justify-between mb-3">
                              <div className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-[0.18em]">Entry Lanes</div>
                              <div className="text-[9px] font-bold text-[#008FD3] bg-[#008FD3]/10 px-2 py-1 rounded-full">3 Gates</div>
                           </div>
                           <div className="space-y-2.5">
                              {[
                                { label: 'North Entrance', wait: '03 min', width: '34%', accent: 'bg-emerald-500' },
                                { label: 'VIP / Speaker', wait: '01 min', width: '18%', accent: 'bg-[#F0AB00]' },
                                { label: 'Expo Access', wait: '06 min', width: '52%', accent: 'bg-[#008FD3]' }
                              ].map((lane) => (
                                <div key={lane.label}>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-slate-700 dark:text-white/90 font-medium">{lane.label}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{lane.wait}</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                                    <div className={`h-full rounded-full ${lane.accent}`} style={{ width: lane.width }}></div>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/45 dark:bg-white/[0.04] p-3">
                           <div className="flex items-center justify-between mb-3">
                              <div className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-[0.18em]">Badge Production</div>
                              <div className="text-[9px] font-bold text-slate-700 dark:text-white">4 Printer</div>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-white/60 dark:bg-white/[0.04] border border-white/20 px-2.5 py-2">
                                <div className="text-[8px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Ready</div>
                                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-white">1.126</div>
                              </div>
                              <div className="rounded-lg bg-white/60 dark:bg-white/[0.04] border border-white/20 px-2.5 py-2">
                                <div className="text-[8px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Reserve</div>
                                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-white">174</div>
                              </div>
                           </div>
                           <div className="mt-3 flex items-center gap-2">
                              {[82, 76, 91, 68].map((height, index) => (
                                <div key={index} className="flex-1 h-10 rounded-md bg-slate-200/80 dark:bg-white/8 overflow-hidden flex items-end">
                                  <div className={`${index === 2 ? 'bg-[#F0AB00]' : 'bg-[#008FD3]'} w-full rounded-t-md`} style={{ height: `${height}%` }}></div>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-white/45 dark:bg-white/[0.04] p-3">
                          <div className="text-[9px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-[0.18em] mb-2">Crew Coverage</div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-700 dark:text-white/90">Supervisor</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="text-slate-700 dark:text-white/90">Technicians</span>
                            <span className="text-slate-500 dark:text-slate-400">3 Onsite</span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                            <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#008FD3] to-[#F0AB00]"></div>
                          </div>
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* Main Card (Front/Left - Event Control Board) */}
              <div className="absolute left-0 top-[32px] sm:top-[40px] w-[min(100%,300px)] sm:w-[400px] lg:w-[460px] h-[230px] sm:h-[320px] lg:h-[360px] bg-white/60 dark:bg-[#0e1621]/90 backdrop-blur-2xl border border-white/40 dark:border-white/20 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden sm:[transform:translateZ(40px)]">
                 {heroVisual.mainImageUrl ? (
                   <img
                     src={heroVisual.mainImageUrl}
                     alt={heroVisual.mainImageAlt || 'Event control board preview'}
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
                        <div className="text-xs font-bold text-slate-700 dark:text-white/90 tracking-wide">Registration Command</div>
                        <div className="w-4"></div>
                     </div>

                     <div className="p-5 grid grid-cols-12 gap-4 flex-1">
                        <div className="col-span-7 rounded-xl border border-white/30 dark:border-white/5 bg-white/55 dark:bg-white/[0.04] p-4 shadow-sm">
                           <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.18em]">Venue Timeline</div>
                                <div className="mt-1 text-lg font-bold text-slate-800 dark:text-white">Doors Open Sequence</div>
                              </div>
                              <div className="text-[10px] font-bold text-[#008FD3] bg-[#008FD3]/10 px-2 py-1 rounded-full">17 Sep</div>
                           </div>
                           <div className="space-y-3">
                              {[
                                { time: '07:00', title: 'Crew Check', note: 'Scanner, printer, LTE fallback live', status: 'bg-emerald-500' },
                                { time: '07:30', title: 'VIP / Speaker Gate', note: 'Fast-lane opens before general access', status: 'bg-[#F0AB00]' },
                                { time: '08:00', title: 'General Check-in', note: '12 counter distributed across 3 entries', status: 'bg-[#008FD3]' },
                                { time: '09:15', title: 'Expo & Session Scan', note: 'Badge validation switches to session mode', status: 'bg-slate-400' }
                              ].map((item) => (
                                <div key={item.time} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.status} mt-1`}></div>
                                    <div className="w-px flex-1 bg-slate-200 dark:bg-white/10 mt-1"></div>
                                  </div>
                                  <div className="pb-2">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.time}</div>
                                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.note}</div>
                                  </div>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="col-span-5 rounded-xl border border-white/30 dark:border-white/5 bg-white/55 dark:bg-white/[0.04] p-4 shadow-sm">
                           <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.18em]">Badge Mix</div>
                           <div className="mt-1 text-lg font-bold text-slate-800 dark:text-white">Production Split</div>
                           <div className="mt-4 space-y-3">
                              {[
                                { label: 'Standard Guests', count: '920', color: 'bg-[#008FD3]', width: '78%' },
                                { label: 'Speaker / VIP', count: '150', color: 'bg-[#F0AB00]', width: '32%' },
                                { label: 'Reserve & Walk-ins', count: '130', color: 'bg-emerald-500', width: '24%' }
                              ].map((item) => (
                                <div key={item.label}>
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-slate-700 dark:text-white/90 font-medium">{item.label}</span>
                                    <span className="text-slate-500 dark:text-slate-400">{item.count}</span>
                                  </div>
                                  <div className="h-2.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }}></div>
                                  </div>
                                </div>
                              ))}
                           </div>
                           <div className="mt-4 grid grid-cols-2 gap-2">
                              <div className="rounded-lg border border-white/20 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2">
                                <div className="text-[8px] uppercase tracking-[0.16em] text-slate-400">Printer</div>
                                <div className="mt-1 text-base font-bold text-slate-800 dark:text-white">4 Live</div>
                              </div>
                              <div className="rounded-lg border border-white/20 bg-white/70 dark:bg-white/[0.03] px-2.5 py-2">
                                <div className="text-[8px] uppercase tracking-[0.16em] text-slate-400">Scanner</div>
                                <div className="mt-1 text-base font-bold text-slate-800 dark:text-white">14 Ready</div>
                              </div>
                           </div>
                        </div>

                        <div className="col-span-12 rounded-xl border border-white/30 dark:border-white/5 bg-white/55 dark:bg-white/[0.04] p-4 shadow-sm">
                           <div className="flex items-center justify-between mb-3">
                               <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.18em]">Operational Status</div>
                               <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Ready for Doors Open</div>
                           </div>
                           <div className="grid grid-cols-4 gap-3">
                              {[
                                { label: 'Check-in Lanes', value: '3 Active', tone: 'bg-[#008FD3]/10 text-[#008FD3]' },
                                { label: 'Onsite Crew', value: '3 + Lead', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                                { label: 'Fallback Network', value: 'LTE Backup', tone: 'bg-[#F0AB00]/10 text-[#b58100]' },
                                { label: 'Branding Assets', value: 'Approved', tone: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300' }
                              ].map((item) => (
                                <div key={item.label} className="rounded-lg border border-white/20 bg-white/70 dark:bg-white/[0.03] p-3">
                                  <div className="text-[8px] uppercase tracking-[0.16em] text-slate-400">{item.label}</div>
                                  <div className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${item.tone}`}>{item.value}</div>
                                </div>
                              ))}
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
