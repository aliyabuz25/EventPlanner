
import React from 'react';
import { Users } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { resolveIcon } from './iconRegistry';

const TeamPage: React.FC = () => {
  const { content } = useSiteContent();
  const company = content.global.company;
  const section = content.pages.team.sections;

  return (
    <div className="pt-32 pb-24 bg-sap-paper dark:bg-[#000000] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
          <div className="text-sap-gold font-bold uppercase tracking-[0.2em] text-xs mb-4">{section.eyebrow}</div>
          <h1 className="text-5xl sm:text-7xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white transition-colors">{section.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-xl leading-relaxed font-normal transition-colors">
            {section.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="relative group">
             <div className="absolute -inset-4 bg-sap-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <img 
               src={section.imageUrl} 
               alt={`${company.name} Professional Team`} 
               className="rounded-3xl shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{section.principlesTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {section.principles.map((p, idx) => {
                const Icon = resolveIcon(p.icon) ?? Users;
                return (
                <div key={idx} className="space-y-3 group">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-sap-gold" />
                    <div className="text-sap-gold font-bold text-xs uppercase tracking-widest">{p.title}</div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-500 text-sm font-normal leading-relaxed transition-colors">{p.description}</p>
                </div>
              )})}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-normal italic text-lg transition-colors border-l-2 border-sap-gold/30 pl-6">
              "{section.quote}"
            </p>
          </div>
        </div>

        <div className="p-16 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[2.5rem] text-center shadow-xl dark:shadow-none transition-colors">
           <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">{section.cta.title}</h3>
           <p className="text-slate-600 dark:text-slate-500 max-w-xl mx-auto mb-10 font-normal text-lg transition-colors">{section.cta.description}</p>
           <a href={section.cta.buttonHref} className="inline-flex px-10 py-4 border border-sap-gold/30 text-sap-gold text-xs font-bold uppercase tracking-widest hover:bg-sap-gold hover:text-white transition-all rounded-xl">
             {section.cta.buttonText}
           </a>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
