
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const BLOCKED_BACKGROUND_VIDEO_URLS = new Set([
  'https://cdn.pixabay.com/video/2023/11/21/189992-887332575_large.mp4'
]);

const Hero: React.FC = () => {
  const { content } = useSiteContent();
  const companyName = content.global.company.name;
  const hero = content.pages.home.sections.hero;
  const heroVisual = hero.visual;
  const terminal = hero.aiTerminal;
  const statusLabels = terminal.statusLabels;
  const neuralEngine = terminal.neuralEngine;
  const studioRoute = content.siteMap.find((entry) => entry.view === 'studio');
  const workspaceLabel = studioRoute?.title || `${companyName} Workspace`;
  const [hasBackgroundVideoError, setHasBackgroundVideoError] = useState(false);
  const backgroundVideoUrl = (heroVisual?.backgroundVideoUrl && BLOCKED_BACKGROUND_VIDEO_URLS.has(heroVisual.backgroundVideoUrl)) ? '' : (heroVisual?.backgroundVideoUrl || '');

  // Typewriter and processing animation logic
  const [displayText, setDisplayText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'thinking' | 'result'>('typing');
  const fullText = terminal.typewriterText;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => setPhase('thinking'), 1000);
      }
    } else if (phase === 'thinking') {
      timeout = setTimeout(() => setPhase('result'), 2000);
    } else if (phase === 'result') {
      timeout = setTimeout(() => {
        setPhase('typing');
        setDisplayText('');
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [displayText, phase]);

  // Mouse Move Tilt Logic
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (-12 to 12 degrees)
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
            <span className="text-slate-800 dark:text-white text-sm font-bold tracking-wider uppercase">
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
            <a
              href="/studio"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-[#0f2740] hover:bg-[#0b2034] text-white font-semibold rounded-2xl transition-all shadow-[0_24px_45px_-24px_rgba(15,39,64,0.75)] flex items-center justify-center gap-2"
            >
              <span>{terminal.plannerCta}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl">
             {hero.stats.map((stat) => (
               <div key={stat.label} className="rounded-[1.4rem] border border-slate-300 dark:border-white/15 bg-white/80 dark:bg-white/[0.04] backdrop-blur-md px-5 py-4 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.28)]">
                  <div className="text-[1.7rem] sm:text-[1.9rem] font-semibold text-slate-900 dark:text-white tracking-[-0.03em]">{stat.value}</div>
                  <div className="mt-1 text-[10px] sm:text-xs lg:text-sm leading-tight text-slate-600 dark:text-slate-400 font-bold uppercase tracking-[0.14em] break-words">{stat.label}</div>
               </div>
             ))}
          </div>
        </div>

        {/* Media Side - 3D Floating Glass Dashboard Composition */}
        <div 
          className="relative mt-12 sm:mt-16 lg:mt-0 flex justify-center lg:justify-end [perspective:3000px] group/scene"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
           <div 
             className="relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[520px] lg:max-w-[650px] h-[380px] sm:h-[480px] lg:h-[550px] [transform-style:preserve-3d] transition-all duration-300 ease-out sm:animate-float-dashboard group-hover/scene:animation-pause"
             style={{
               transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
             }}
           >
              
              {/* Secondary Card (Background) */}
              <div className="absolute right-0 top-0 sm:top-[-20px] w-[180px] sm:w-[280px] lg:w-[340px] h-[320px] sm:h-[420px] lg:h-[500px] bg-white/20 dark:bg-white/[0.02] backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-3xl shadow-2xl sm:[transform:translateZ(-60px)] flex flex-col overflow-hidden transition-all duration-700">
                 {/* Scan light effect */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sap-blue/10 to-transparent h-20 w-full animate-scan pointer-events-none"></div>

                 <div className="p-4 sm:p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 sm:mb-8">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sap-gold animate-pulse shadow-[0_0_8px_rgba(203,155,66,0.5)]"></div>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">{neuralEngine.label}</span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-slate-500">{neuralEngine.version}</span>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        {[
                          { label: neuralEngine.intelligence, val: '88%', color: 'from-sap-blue to-sap-accent' },
                          { label: neuralEngine.reliability, val: '99.9%', color: 'from-emerald-400 to-emerald-600' },
                          { label: neuralEngine.performance, val: '94%', color: 'from-sap-gold to-orange-400' }
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-[10px] sm:text-xs font-bold mb-1.5 sm:mb-2 text-slate-800 dark:text-white/90 uppercase tracking-wider">
                              <span>{item.label}</span>
                              <span className="text-sap-accent animate-data-pulse">{item.val}</span>
                            </div>
                            <div className="h-1 sm:h-1.5 w-full bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-[0_0_8px_rgba(0,143,211,0.3)] animate-progress-indefinite`} style={{ width: phase === 'result' ? item.val : '15%' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-slate-300 dark:border-white/10">
                        <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-2 sm:mb-3 tracking-widest flex items-center justify-between">
                          <span>{neuralEngine.activeThreads}</span>
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 font-mono text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                          <div className="flex justify-between"><span>{neuralEngine.clusterA}</span><span className="text-emerald-500 font-bold">{neuralEngine.connected}</span></div>
                          <div className="flex justify-between font-bold text-slate-900 dark:text-slate-200"><span>{neuralEngine.latency}</span><span>14ms</span></div>
                          <div className="flex justify-between"><span>{neuralEngine.traffic}</span><span className="animate-data-pulse font-bold">{phase === 'result' ? '2.4k req/s' : '0.1k req/s'}</span></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl sm:rounded-2xl bg-white/40 dark:bg-white/[0.05] p-3 sm:p-4 border border-slate-300 dark:border-white/15 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">{neuralEngine.systemStatus}</div>
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-baseline gap-1">
                        {workspaceLabel} <span className="text-[10px] sm:text-xs text-emerald-500 font-black tracking-wide ml-1">{phase === 'result' ? statusLabels.ready : statusLabels.analyzing}</span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Main Card (Foreground) */}
              <div className="absolute left-0 top-[60px] sm:top-[40px] w-full sm:w-[500px] lg:w-[620px] h-[300px] sm:h-[420px] lg:h-[480px] bg-white/80 dark:bg-[#050505]/95 backdrop-blur-3xl border border-white dark:border-white/10 rounded-3xl shadow-[0_32px_128px_-32px_rgba(0,0,0,0.25)] dark:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden sm:[transform:translateZ(80px)] transition-all duration-700">
                 {/* Secondary Scanning Laser */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sap-gold/5 to-transparent w-20 h-full animate-scan-horizontal pointer-events-none"></div>

                 <div className="h-12 sm:h-16 bg-white/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center px-5 sm:px-8 justify-between shrink-0">
                    <div className="flex space-x-2 sm:space-x-2.5">
                       <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.4)]"></div>
                       <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]"></div>
                       <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]"></div>
                    </div>
                    <div className="text-[10px] sm:text-sm font-black text-sap-blue dark:text-white tracking-[0.2em] sm:tracking-[0.3em] uppercase opacity-90 px-2 sm:px-4">{companyName} Core Terminal</div>
                    <div className={`flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white shadow-xl transition-all duration-500 scale-90 sm:scale-95 origin-right ${phase === 'result' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-sap-blue shadow-sap-blue/30'}`}>
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white ${phase !== 'result' ? 'animate-pulse' : ''}`}></div>
                      <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] shrink-0">
                        {phase === 'typing' ? statusLabels.idle : phase === 'thinking' ? statusLabels.reasoning : statusLabels.success}
                      </span>
                    </div>
                 </div>

                 <div className="flex-1 p-5 sm:p-8 flex flex-col gap-5 sm:gap-8 overflow-hidden relative">
                   {/* Prompt Input Visualization */}
                   <div className="rounded-xl sm:rounded-2xl bg-slate-100/50 dark:bg-white/[0.03] p-4 sm:p-5 border border-slate-300 dark:border-white/15 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] relative group/prompt overflow-hidden">
                      <div className="absolute top-0 right-0 w-12 sm:w-20 h-full bg-gradient-to-l from-sap-blue/5 to-transparent"></div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-sap-gold flex items-center justify-center shadow-md">
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 20h9M3 20h.01M3 4l9 16L21 4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{terminal.badge}</span>
                      </div>
                      <div className="text-xs sm:text-base leading-relaxed text-slate-800 dark:text-white/90 font-bold font-mono min-h-[3em]">
                        "{displayText}"
                        {phase === 'typing' && <span className="inline-block w-1.5 h-4 sm:w-2 sm:h-5 bg-sap-blue dark:bg-sap-accent ml-1 align-middle animate-pulse"></span>}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 sm:gap-10 flex-1 min-h-0">
                     <div className="space-y-4 sm:space-y-5 flex flex-col">
                       <div className="text-[10px] sm:text-xs font-black text-sap-accent uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-1.5 sm:gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-sap-accent"></span>
                         {statusLabels.reasoning}
                       </div>
                       <div className="flex-1 space-y-3 sm:space-y-4 font-mono text-[10px] sm:text-xs leading-tight overflow-hidden">
                         {terminal.reasoningLogs.map((log, i) => {
                           const isDone = (phase === 'thinking' && i < 2) || phase === 'result';
                           const isCurrent = (phase === 'thinking' && i >= 2 && i < 4);
                           return (
                             <div key={i} className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ${isDone || isCurrent ? 'opacity-100' : 'opacity-20'}`}>
                               <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isDone ? 'bg-emerald-500 brightness-125' : isCurrent ? 'bg-sap-gold animate-pulse' : 'bg-slate-300'}`}></div>
                               <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{log}</span>
                               <span className={`ml-auto font-black text-[8px] sm:text-xs tracking-tighter ${isDone ? 'text-emerald-500' : isCurrent ? 'text-sap-gold' : 'text-slate-400'}`}>
                                 {isDone ? 'DONE' : isCurrent ? 'BUSY' : 'WAIT'}
                               </span>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                     <div className="space-y-4 sm:space-y-5">
                       <div className="text-[10px] sm:text-xs font-black text-sap-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-1.5 sm:gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-sap-gold"></span>
                         {terminal.assetsTitle}
                       </div>
                       <div className="space-y-2 sm:space-y-3">
                         {[
                           { name: 'Plan.v2', type: 'PDF', color: 'bg-emerald-500' },
                           { name: 'Matrix', type: 'XLSX', color: 'bg-sap-blue' },
                           { name: 'Cards', type: 'JSON', color: 'bg-sap-gold' }
                         ].map((file, i) => {
                           const isVisible = (phase === 'result') || (phase === 'thinking' && i === 0);
                           return (
                             <div key={file.name} className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${file.color} bg-opacity-15 flex items-center justify-center shrink-0`}>
                                  <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${file.color} rounded shadow-[0_0_10px_${file.color}] opacity-80`}></div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white truncate tracking-tight">{file.name}</span>
                                  <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">{file.type}</span>
                                </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   </div>

                   <div className="mt-auto pt-5 sm:pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1.25rem] bg-gradient-to-br from-sap-blue to-sap-accent flex items-center justify-center shadow-xl sm:shadow-2xl transform active:scale-95 transition-all">
                           <div className={`w-4 h-4 sm:w-5 sm:h-5 border-1 sm:border-2 border-white/60 rounded rotate-45 flex items-center justify-center transition-transform duration-700 ${phase === 'thinking' ? 'animate-spin' : ''}`}>
                             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                           </div>
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{terminal.genAiSystem}</div>
                          <div className={`text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 transition-colors duration-500 ${phase === 'result' ? 'text-emerald-500' : 'text-sap-blue dark:text-sap-accent'}`}>
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${phase === 'result' ? 'bg-emerald-400' : 'bg-sap-blue'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${phase === 'result' ? 'bg-emerald-500' : 'bg-sap-blue'}`}></span>
                            </span>
                            {phase === 'typing' ? statusLabels.idle : phase === 'thinking' ? statusLabels.reasoning : statusLabels.completed}
                          </div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end gap-1.5 sm:gap-2.5 bg-slate-50 dark:bg-white/[0.03] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-white/5">
                       <div className="flex items-baseline gap-1.5 sm:gap-2">
                         <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{terminal.efficiency}</span>
                         <span className="text-[12px] sm:text-[15px] font-black text-sap-blue dark:text-sap-accent tabular-nums">
                           {phase === 'result' ? '98.4%' : phase === 'thinking' ? '82.1%' : '0.0%'}
                         </span>
                       </div>
                       <div className="flex h-1.5 sm:h-2 w-24 sm:w-32 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full bg-gradient-to-r from-sap-blue via-sap-accent to-emerald-400 transition-all duration-1000 ${phase === 'result' ? 'w-[98%]' : phase === 'thinking' ? 'w-[82%]' : 'w-0'}`}></div>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-sap-blue/10 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none animate-pulse"></div>
              <div className="absolute -bottom-16 -right-16 w-48 h-48 sm:w-60 sm:h-60 bg-sap-gold/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none animate-pulse delay-700"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
