import React from 'react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { ArrowRight } from 'lucide-react';

const SapB1CTA: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.cta;

  return (
    <div className="py-32 bg-white dark:bg-[#000000] text-center relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sap-blue/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight leading-tight">
          {section.title}
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto font-medium">
          {section.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href={section.primaryHref}
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex items-center px-12 py-6 bg-sap-blue text-white font-bold rounded-full text-lg hover:bg-[#007db8] transition-all shadow-[0_20px_40px_-10px_rgba(0,143,211,0.4)] hover:-translate-y-1 active:scale-95"
          >
            {section.primaryText}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href={section.secondaryHref} className="px-12 py-6 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-full text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95">
            {section.secondaryText}
          </a>
        </div>
        
        <div className="mt-20 pt-10 border-t border-slate-100 dark:border-white/5 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{section.trustedLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default SapB1CTA;
