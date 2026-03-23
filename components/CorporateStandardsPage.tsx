
import React from 'react';
import { Mail, Download, ShieldCheck } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const CorporateStandardsPage: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.corporateStandards.sections;

  return (
    <div className="pt-32 pb-24 bg-sap-paper dark:bg-[#000000] transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-20 text-center">
          <div className="text-sap-gold font-bold uppercase tracking-[0.2em] text-xs mb-4">{section.eyebrow}</div>
          <h1 className="text-5xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white transition-colors">{section.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-normal transition-colors">
            {section.intro}
          </p>
        </div>

        <div className="space-y-6">
           <div className="p-10 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[2rem] group hover:border-sap-gold/20 transition-all shadow-xl dark:shadow-none">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-sap-gold/10 rounded-xl flex items-center justify-center text-sap-gold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{section.inquiryCard.title}</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-500 mb-8 font-normal leading-relaxed transition-colors text-lg">
                {section.inquiryCard.description}
              </p>
              <div className="flex items-center space-x-3 text-sap-gold">
                <Mail className="w-5 h-5" />
                <span className="font-bold text-lg">{section.inquiryCard.email}</span>
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-6">
              {section.documents.map((doc, idx) => (
                <div key={idx} className="p-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-[2rem] flex justify-between items-center group cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all shadow-md dark:shadow-none">
                   <div>
                     <div className="text-slate-800 dark:text-white font-bold text-lg mb-1 transition-colors">{doc.title}</div>
                     <div className="text-[10px] text-slate-500 font-bold tracking-[0.2em]">{doc.lang}</div>
                   </div>
                   <div className="text-slate-400 group-hover:text-sap-gold transition-colors">
                     <Download className="w-6 h-6" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="mt-16 p-10 bg-sap-gold/5 border border-sap-gold/10 rounded-[2rem]">
           <h3 className="text-slate-900 dark:text-white font-bold uppercase mb-3 text-sm tracking-widest transition-colors">{section.transparency.title}</h3>
           <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-normal italic transition-colors">
             "{section.transparency.quote}"
           </p>
        </div>
      </div>
    </div>
  );
};

export default CorporateStandardsPage;
