import React, { useState, useEffect, useRef } from 'react';
import CoreWheel from './sap-b1/CoreWheel';
import FioriMockup from './sap-b1/FioriMockup';
import SapB1Stats from './sap-b1/SapB1Stats';
import FinancialsSection from './sap-b1/FinancialsSection';
import SalesSection from './sap-b1/SalesSection';
import PurchasingSection from './sap-b1/PurchasingSection';
import ProductionSection from './sap-b1/ProductionSection';
import InnovationSection from './sap-b1/InnovationSection';
import SapB1CTA from './sap-b1/SapB1CTA';
import { useSiteContent } from '../contexts/SiteContentContext';
import { 
  ArrowRight, 
  Download, 
  Play, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { resolveIcon } from './iconRegistry';

// --- Custom Hooks & Helpers ---

const useOnScreen = (options: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return [ref, isVisible] as const;
};

const CountUp = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useOnScreen({ threshold: 0.5 });

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// --- Main Page Component ---

const SapBusinessOnePage: React.FC = () => {
  const { content } = useSiteContent();
  const sections = content.pages.sapBusinessOne.sections;
  const hero = sections.hero;
  const webInterface = sections.webInterface;
  const analytics = sections.analytics;
  const industries = sections.industries;
  const deployment = sections.deployment;

  return (
    <div className="pt-20 bg-white dark:bg-[#000000] overflow-hidden transition-colors duration-300">
      
      {/* --- HERO SECTION --- */}
      <div className="relative min-h-[95vh] flex items-center bg-gradient-to-br from-indigo-700 via-purple-600 to-sap-blue text-white overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 blur-[120px] rounded-full animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/20 blur-[100px] rounded-full"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-white/5 rounded-full scale-150"></div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl">
               <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
               {hero.badge}
            </div>
            <h1 className="text-6xl sm:text-8xl font-black leading-[0.9] mb-10 tracking-tighter">
              {hero.title[0]} <br/>
              {hero.title[1]} <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">{hero.title[2]}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-xl mb-12 leading-relaxed font-medium">
              {hero.description}
            </p>
            <div className="flex flex-wrap gap-6">
              <a href={hero.primaryHref} className="group px-10 py-5 bg-white text-indigo-700 font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:bg-indigo-50 hover:-translate-y-1 transition-all flex items-center">
                <Download className="mr-3 w-5 h-5 group-hover:bounce transition-transform" />
                {hero.primaryCta}
              </a>
              <a href={hero.secondaryHref} className="group px-10 py-5 border-2 border-white/30 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl flex items-center">
                <Play className="mr-3 w-5 h-5 fill-current" />
                {hero.secondaryCta}
              </a>
            </div>
          </div>
          
          <div className="relative h-[700px] hidden lg:flex items-center justify-center perspective-[2000px]">
             <div className="grid grid-cols-2 gap-8 transform rotate-y-[-25deg] rotate-x-[15deg] hover:rotate-y-[-15deg] transition-transform duration-1000">
                <div className="space-y-8">
                  {hero.gallery.slice(0, 2).map((item) => item.type === 'image' ? (
                    <img key={item.src} src={item.src} className="rounded-[2.5rem] shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-700" alt={item.alt} />
                  ) : (
                    <video key={item.src} src={item.src} poster={item.poster} className="rounded-[2.5rem] shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-700" autoPlay muted loop playsInline />
                  ))}
                </div>
                <div className="space-y-8 pt-20">
                  {hero.gallery.slice(2, 4).map((item) => item.type === 'image' ? (
                    <img key={item.src} src={item.src} className="rounded-[2.5rem] shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-700" alt={item.alt} />
                  ) : (
                    <video key={item.src} src={item.src} poster={item.poster} className="rounded-[2.5rem] shadow-2xl border-4 border-white/10 hover:scale-105 transition-transform duration-700" autoPlay muted loop playsInline />
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <SapB1Stats CountUp={CountUp} />

      <CoreWheel />

      {/* --- WEB INTERFACE --- */}
      <div className="py-32 bg-white dark:bg-[#000000] border-y border-slate-100 dark:border-white/5">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
               <div className="animate-in fade-in slide-in-from-left duration-1000">
                  <div className="text-sap-blue font-black uppercase tracking-[0.4em] text-[10px] mb-6">{webInterface.eyebrow}</div>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">
                    {webInterface.title[0]} <br /> {webInterface.title[1]}
                  </h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                     {webInterface.description}
                  </p>
                  <ul className="space-y-6">
                     {webInterface.points.map((pt, i) => (
                        <li key={i} className="flex items-center group">
                           <div className="w-10 h-10 bg-sap-blue/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-sap-blue group-hover:text-white transition-all duration-300">
                             <CheckCircle2 className="w-5 h-5" />
                           </div>
                           <span className="text-slate-700 dark:text-slate-300 font-bold text-lg">{pt}</span>
                        </li>
                     ))}
                  </ul>
               </div>
               
               <FioriMockup />
            </div>
         </div>
      </div>

      <FinancialsSection />
      <SalesSection />
      <PurchasingSection />
      <ProductionSection />

      {/* --- ANALYTICS --- */}
      <div className="py-32 bg-[#fefce8] dark:bg-[#1a1500] border-t border-slate-100 dark:border-white/5">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center mb-24">
            <div className="text-yellow-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6">{analytics.eyebrow}</div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">{analytics.title}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
               {analytics.description}
            </p>
         </div>
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {analytics.cards.map((item, idx) => (
               <div key={idx} className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[2.5rem] shadow-xl border-t-8 border-yellow-400 hover:-translate-y-2 transition-all duration-500 group">
                  <div className="text-6xl font-black text-yellow-400/10 mb-6 group-hover:text-yellow-400/20 transition-colors">0{idx+1}</div>
                  <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.description}</p>
               </div>
            ))}
         </div>
      </div>

      <InnovationSection />

      {/* --- INDUSTRIES --- */}
      <div className="py-32 bg-slate-50 dark:bg-[#0a0a0a]">
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="mb-20 border-b border-slate-200 dark:border-white/10 pb-12 flex flex-col md:flex-row justify-between items-end gap-6">
               <div>
                  <div className="text-sap-blue font-black uppercase tracking-[0.4em] text-[10px] mb-4">{industries.eyebrow}</div>
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{industries.title}</h2>
               </div>
               <div className="text-right">
                 <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">{industries.ecosystemLabel}</div>
                 <div className="text-sap-blue font-bold text-lg">{industries.ecosystemValue}</div>
               </div>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
               {industries.items.map((ind, i) => (
                  <div key={i} className="p-8 bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 hover:border-sap-blue hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                     <h3 className="font-black text-lg text-slate-900 dark:text-white mb-4 group-hover:text-sap-blue transition-colors leading-tight">{ind.title}</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{ind.description}</p>
                     <div className="mt-6 flex items-center text-sap-blue text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                       {ind.cta} <ChevronRight className="ml-1 w-3 h-3" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* --- DEPLOYMENT --- */}
      <div className="py-32 bg-sap-blue text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[150px]"></div>
         </div>

         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center mb-24 relative z-10">
            <div className="text-white/60 font-black uppercase tracking-[0.4em] text-[10px] mb-6">{deployment.eyebrow}</div>
            <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{deployment.title}</h2>
         </div>
         <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid md:grid-cols-3 gap-12 relative z-10">
            {deployment.options.map((opt, idx) => {
              const Icon = resolveIcon(opt.icon);
              return (
                <div key={idx} className="bg-white text-slate-900 p-12 rounded-[3rem] text-center shadow-2xl transform hover:-translate-y-4 transition-all duration-700 group">
                   <div className={`w-24 h-24 ${opt.background} rounded-[2rem] flex items-center justify-center mx-auto mb-10 ${opt.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                      <Icon className="w-10 h-10" />
                   </div>
                   <h3 className="text-3xl font-black mb-6 tracking-tight">{opt.title}</h3>
                   <p className="text-slate-500 text-lg leading-relaxed font-medium">{opt.description}</p>
                </div>
              );
            })}
         </div>
      </div>

      <SapB1CTA />

    </div>
  );
};

export default SapBusinessOnePage;
