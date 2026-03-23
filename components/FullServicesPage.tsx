
import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { resolveIcon } from './iconRegistry';

const FullServicesPage: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.services.sections;

  return (
    <div className="pt-40 pb-32 bg-sap-paper dark:bg-[#000000] transition-colors duration-500">
      {/* Max-width expanded to 1800px and padding adjusted to fill screen better */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-16 w-full">
        {/* Header Section */}
        <div className="mb-24 border-b border-slate-200 dark:border-white/10 pb-12 transition-colors">
          <div className="text-sap-gold font-bold uppercase tracking-[0.2em] text-sm mb-4">{section.eyebrow}</div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white leading-none transition-colors">
            {section.title[0]} <br />{section.title[1]}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-4xl text-xl leading-relaxed font-normal transition-colors">
            {section.description}
          </p>
        </div>

        {/* Main Sections - Non-Sticky, Static Layout with SAP Card Style */}
        <div className="space-y-24 mb-32">
          {section.phases.map((s, idx) => (
            <div key={idx} className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5">
                <div className="relative border-l-4 border-sap-blue pl-8 py-2">
                  <div className="text-sap-blue font-bold text-xs uppercase tracking-widest mb-3">
                    Phase 0{idx + 1}
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors">
                    {s.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-normal max-w-xl transition-colors">
                    {s.description}
                  </p>
                </div>
              </div>

              {/* Right Column - Fiori-like Card */}
              <div className="lg:col-span-7">
                <div className="bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 p-10 rounded-3xl shadow-xl relative overflow-hidden h-full flex flex-col justify-center hover:border-sap-blue/30 transition-all duration-500">
                   {/* Decorative background element */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-sap-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                   
                   <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                     {s.steps.map((step, i) => (
                       <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-white/5 hover:border-sap-blue transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-sap-blue/10 flex items-center justify-center text-xs font-bold text-sap-blue group-hover:bg-sap-blue group-hover:text-white transition-all flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors">{step}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-Width Support Blocks */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
           {section.supportCards.map((card) => {
             const Icon = resolveIcon(card.icon) ?? ShieldCheck;
             const isGold = card.accent === 'gold';
             return (
               <div key={card.title} className={`p-12 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-[2.5rem] transition-all group shadow-md dark:shadow-none ${isGold ? 'hover:border-sap-gold/50' : 'hover:border-sap-blue/50'}`}>
                  <div className="flex items-center space-x-5 mb-6">
                    <div className={`p-3 rounded-xl ${isGold ? 'bg-sap-gold/10' : 'bg-sap-blue/10'}`}>
                      <Icon className={`w-8 h-8 ${isGold ? 'text-sap-gold' : 'text-sap-blue'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{card.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 font-normal transition-colors">
                    {card.description}
                  </p>
                  <div className={`${isGold ? 'text-sap-gold' : 'text-sap-blue'} font-bold text-xs uppercase tracking-widest flex items-center`}>
                     {card.meta}
                     {isGold ? (
                       <span className="w-2 h-2 bg-sap-gold rounded-full ml-3 animate-pulse shadow-[0_0_8px_#F0AB00]"></span>
                     ) : (
                       <CheckCircle2 className="w-4 h-4 ml-2" />
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default FullServicesPage;
