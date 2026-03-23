
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const CampaignSection: React.FC = () => {
  const { content } = useSiteContent();
  const campaign = content.pages.campaign.sections;

  return (
    <section className="relative py-32 overflow-hidden bg-slate-50 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/[0.05] transition-colors duration-500">
      {/* Circuit Brain Graphic Background (SVG) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-3/5 opacity-10 pointer-events-none">
        <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M400 100C300 100 220 180 220 280C220 380 300 460 400 460" stroke="#F0AB00" strokeWidth="2" strokeDasharray="10 10" />
          <circle cx="400" cy="280" r="150" stroke="#F0AB00" strokeWidth="1" />
          <path d="M550 280H750M550 200H700M550 360H700" stroke="#F0AB00" strokeWidth="2" />
          <circle cx="750" cy="280" r="5" fill="#F0AB00" />
          <circle cx="700" cy="200" r="5" fill="#F0AB00" />
          <circle cx="700" cy="360" r="5" fill="#F0AB00" />
        </svg>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-24 w-full">
        <div className="lg:w-3/5">
          <div className="inline-block px-5 py-2 bg-sap-gold/10 border border-sap-gold/20 text-sap-gold text-xs font-bold uppercase tracking-[0.2em] mb-8 rounded-full">
            {campaign.badge}
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-none transition-colors">
            {campaign.titleLines[0]} <br />
            <span className="text-sap-gold">{campaign.titleLines[1]}</span>
          </h2>
          <div className="space-y-4 mb-10">
            <div className="text-xs font-bold uppercase text-slate-500 tracking-widest">{campaign.initiativesLabel}</div>
            <p className="text-2xl text-slate-600 dark:text-slate-400 font-normal max-w-3xl leading-relaxed transition-colors">
              {campaign.initiativesText}
            </p>
          </div>
          <a href={campaign.buttonHref} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:bg-sap-gold dark:hover:bg-sap-gold hover:text-white dark:hover:text-white transition-all rounded-xl shadow-xl flex items-center space-x-3 group">
            <span>{campaign.buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="lg:w-2/5 text-center lg:text-right hidden lg:block">
          <div className="text-6xl lg:text-9xl font-black text-slate-200 dark:text-white/5 uppercase tracking-tighter leading-none select-none transition-colors">
            {campaign.sideWords[0]} <br />
            {campaign.sideWords[1]} <br />
            <span className="text-sap-gold/10">{campaign.sideWords[2]}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampaignSection;
