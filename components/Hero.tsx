
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const BLOCKED_BACKGROUND_VIDEO_URLS = new Set([
  'https://cdn.pixabay.com/video/2023/11/21/189992-887332575_large.mp4'
]);

const Hero: React.FC<{ onOpenStudio: () => void }> = ({ onOpenStudio }) => {
  const { content } = useSiteContent();
  const hero = content.pages.home.sections.hero;
  const heroVisual = hero.visual;
  const [hasBackgroundVideoError, setHasBackgroundVideoError] = useState(false);
  const backgroundVideoUrl = BLOCKED_BACKGROUND_VIDEO_URLS.has(heroVisual.backgroundVideoUrl) ? '' : heroVisual.backgroundVideoUrl;

  return (
    <div id="home" className="relative flex items-center pt-24 pb-16 sm:pb-20 lg:min-h-screen overflow-hidden bg-sap-paper dark:bg-dark-base transition-colors duration-500">
      {backgroundVideoUrl && !hasBackgroundVideoError ? (
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-[0.28] dark:opacity-[0.22]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setHasBackgroundVideoError(true)}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,244,237,0.92)_0%,rgba(247,244,237,0.78)_42%,rgba(247,244,237,0.56)_100%)] dark:bg-[linear-gradient(90deg,rgba(5,5,5,0.92)_0%,rgba(5,5,5,0.82)_45%,rgba(5,5,5,0.62)_100%)]"></div>
        </div>
      ) : null}

      {/* SAP-style ambient gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sap-blue/10 dark:bg-sap-blue/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/4 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sap-gold/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/4 transition-colors duration-500"></div>

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-10 lg:gap-24 items-center relative z-10 w-full">
        {/* Text Side */}
        <div className="text-left relative z-40">
          <div className="inline-flex items-center gap-3 mb-6 sm:mb-8 bg-white/88 dark:bg-white/[0.05] border border-white/70 dark:border-white/10 w-fit px-4 sm:px-5 py-2.5 rounded-full backdrop-blur-md shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all">
            <span className="w-2.5 h-2.5 bg-sap-gold rounded-full shadow-[0_0_12px_rgba(216,162,61,0.8)]"></span>
            <span className="text-slate-800 dark:text-white text-xs font-bold tracking-wider uppercase">
              {hero.badge}
            </span>
          </div>
          
          <h1 className="max-w-[12ch] text-[3rem] sm:text-[4.35rem] lg:text-[5.4rem] font-semibold tracking-[-0.045em] leading-[0.94] mb-6 sm:mb-8 text-slate-900 dark:text-white transition-colors">
            <span className="block">{hero.title.lineOne}</span>
            <span className="block text-sap-blue drop-shadow-[0_16px_30px_rgba(22,35,63,0.12)]">{hero.title.highlight}</span>
            <span className="block text-slate-500 dark:text-white/88 font-light">{hero.title.lineThree}</span>
          </h1>
          
          <p className="text-[1.02rem] sm:text-[1.18rem] text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 max-w-2xl leading-relaxed font-normal pl-5 sm:pl-6 relative transition-colors">
            <span className="absolute left-0 top-1 bottom-1 w-px bg-gradient-to-b from-sap-gold via-sap-blue/50 to-transparent"></span>
            {hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-12 sm:mb-14">
            <button
              type="button"
              onClick={onOpenStudio}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-[#0f2740] hover:bg-[#0b2034] text-white font-semibold rounded-2xl transition-all shadow-[0_24px_45px_-24px_rgba(15,39,64,0.75)] flex items-center justify-center gap-2"
            >
              <span>FastLane Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl">
             {hero.stats.map((stat) => (
               <div key={stat.label} className="rounded-[1.4rem] border border-white/70 dark:border-white/8 bg-white/80 dark:bg-white/[0.04] backdrop-blur-md px-5 py-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)]">
                  <div className="text-[1.7rem] sm:text-[1.9rem] font-semibold text-slate-900 dark:text-white tracking-[-0.03em]">{stat.value}</div>
                  <div className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-[0.14em]">{stat.label}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Media Side - 3D Floating Glass Dashboard Composition */}
        <div className="relative mt-4 sm:mt-8 lg:mt-0 flex justify-center lg:justify-end [perspective:2000px] group/scene">
           <div className="relative w-full max-w-[340px] sm:max-w-[520px] lg:max-w-[650px] h-[320px] sm:h-[420px] lg:h-[500px] [transform-style:preserve-3d] sm:[transform:rotateY(-10deg)_rotateX(4deg)] group-hover/scene:sm:[transform:rotateY(-4deg)_rotateX(2deg)] transition-all duration-1000 ease-out">
              
              {/* Secondary Card (Background) */}
              <div className="absolute right-0 top-0 sm:top-[-15px] w-[180px] sm:w-[240px] lg:w-[280px] h-[300px] sm:h-[400px] lg:h-[480px] bg-white/20 dark:bg-white/[0.02] backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl sm:[transform:translateZ(-50px)] flex flex-col overflow-hidden transition-all duration-700">
                 <div className="p-5 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-sap-gold animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Core Engine</span>
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: 'Intelligence', val: '88%', color: 'from-sap-blue to-sap-accent' },
                          { label: 'Security', val: '100%', color: 'from-emerald-400 to-emerald-600' },
                          { label: 'Performance', val: '94%', color: 'from-sap-gold to-orange-400' }
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[10px] font-bold mb-2 text-slate-700 dark:text-white/80 uppercase">
                              <span>{item.label}</span>
                              <span className="text-sap-accent">{item.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: item.val }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/40 dark:bg-white/[0.05] p-4 border border-white/20">
                      <div className="text-[9px] font-bold text-slate-400 uppercase mb-2">System Status</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Workspace Ready</div>
                    </div>
                 </div>
              </div>

              {/* Main Card (Foreground) */}
              <div className="absolute left-0 top-[40px] w-full sm:w-[420px] lg:w-[480px] h-[240px] sm:h-[340px] lg:h-[380px] bg-white/70 dark:bg-[#080808]/80 backdrop-blur-3xl border border-white dark:border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden sm:[transform:translateZ(60px)] transition-all duration-700">
                 <div className="h-14 bg-white/40 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center px-6 justify-between">
                    <div className="flex space-x-2">
                       <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10"></div>
                       <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10"></div>
                       <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-white/10"></div>
                    </div>
                    <div className="text-xs font-bold text-sap-blue dark:text-white tracking-widest uppercase opacity-80">AI Workspace</div>
                    <div className="w-6 h-6 rounded-full bg-sap-gold/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-sap-gold"></div>
                    </div>
                 </div>

                 <div className="flex-1 p-6 flex flex-col justify-between">
                   <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-4">
                       <div className="text-[9px] font-black text-sap-accent uppercase tracking-[0.25em]">Live Briefing</div>
                       <div className="space-y-3">
                         <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/5 rounded animate-pulse"></div>
                         <div className="h-4 w-1/2 bg-slate-100 dark:bg-white/5 rounded"></div>
                         <div className="h-4 w-2/3 bg-slate-100 dark:bg-white/5 rounded"></div>
                       </div>
                     </div>
                     <div className="space-y-4">
                       <div className="text-[9px] font-black text-sap-gold uppercase tracking-[0.25em]">Deliverables</div>
                       <div className="flex flex-wrap gap-2">
                         {['JSON', 'PDF', 'XLS'].map(tag => (
                           <div key={tag} className="px-2 py-1 rounded-md bg-sap-blue/5 dark:bg-white/5 text-[9px] font-bold text-sap-blue dark:text-white/60 border border-sap-blue/10 dark:border-white/5">
                             {tag}
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sap-blue to-sap-accent flex items-center justify-center shadow-lg">
                          <div className="w-4 h-4 border-2 border-white/50 rounded-sm rotate-45"></div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">Assistant Active</div>
                          <div className="text-[10px] text-slate-400 font-medium">Listening to requirements...</div>
                        </div>
                     </div>
                     <div className="flex h-1.5 w-24 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-sap-gold rounded-full"></div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-sap-blue/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-sap-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
