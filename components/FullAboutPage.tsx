
import React from 'react';
import { ShieldCheck, Target, Eye, History } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';
import { resolveIcon } from './iconRegistry';

const FullAboutPage: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.about.sections;

  return (
    <div className="pt-40 pb-32 bg-sap-paper dark:bg-[#000000] transition-colors duration-500">
      {/* About Hero */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-32 w-full">
        <div className="inline-block px-5 py-2 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] text-sap-gold text-xs font-bold uppercase tracking-[0.2em] mb-10 rounded-full shadow-sm">
          {section.heroBadge}
        </div>
        <h1 className="text-6xl sm:text-8xl font-bold mb-10 leading-tight text-slate-900 dark:text-white tracking-tight transition-colors">
          {section.heroTitle[0]} <br />
          <span className="text-sap-gold">{section.heroTitle[1]}</span>
        </h1>
        <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-5xl leading-relaxed font-normal transition-colors">
          {section.intro}
        </p>
      </div>

      {/* Mission & Vision Section */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-px bg-slate-300 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.08] mb-40 w-full rounded-[3rem] overflow-hidden shadow-sm transition-colors">
        <div className="p-24 bg-slate-50 dark:bg-[#050505] group hover:bg-slate-100 dark:hover:bg-[#0a0a0a] transition-all">
          <div className="flex items-center space-x-4 mb-8">
            <Target className="w-8 h-8 text-sap-gold" />
            <div className="h-1 w-16 bg-sap-gold rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">{section.mission.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xl italic font-normal">
            "{section.mission.description}"
          </p>
        </div>
        <div className="p-24 bg-slate-50 dark:bg-[#050505] group hover:bg-slate-100 dark:hover:bg-[#0a0a0a] transition-all">
          <div className="flex items-center space-x-4 mb-8">
            <Eye className="w-8 h-8 text-sap-gold" />
            <div className="h-1 w-16 bg-sap-gold rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">{section.vision.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xl italic font-normal">
            "{section.vision.description}"
          </p>
        </div>
      </div>

      {/* Corporate Values */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-40 w-full">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight transition-colors">{section.valuesTitle}</h2>
          <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{section.valuesSubtitle}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {section.values.map((v, idx) => {
            const Icon = resolveIcon(v.icon) ?? ShieldCheck;
            return (
            <div key={idx} className="p-12 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all text-center rounded-[2.5rem] shadow-sm dark:shadow-none">
              <div className="flex justify-center mb-8 text-sap-gold">
                <Icon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">{v.title}</h3>
              <p className="text-lg text-slate-600 dark:text-slate-500 leading-relaxed font-normal">{v.description}</p>
            </div>
          )})}
        </div>
      </div>

      {/* History / Timeline */}
      <div className="bg-slate-50 dark:bg-[#050505] py-32 border-y border-slate-200 dark:border-white/[0.08] transition-colors">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20">
            <div className="flex items-center space-x-4">
                <History className="w-8 h-8 text-sap-gold" />
              <div>
                <h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight transition-colors">{section.timeline.title}</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{section.timeline.description}</p>
              </div>
            </div>
            <div className="mt-8 md:mt-0 px-8 py-3 border border-sap-gold/20 bg-sap-gold/5 text-sap-gold text-xs font-bold uppercase tracking-widest rounded-full">
              {section.timeline.badge}
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12">
            {section.timeline.items.map((item) => (
              <div key={item.year} className="space-y-4">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{item.year}</div>
                <div className="text-xs font-bold text-sap-gold uppercase tracking-widest">{item.label}</div>
                <p className="text-lg text-slate-600 dark:text-slate-500 font-normal leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-40 text-center w-full">
        <div className="bg-slate-50 dark:bg-[#0a0a0a] p-24 border border-slate-200 dark:border-white/[0.08] rounded-[3rem] shadow-xl dark:shadow-sm transition-colors">
          <h2 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight text-center">{section.cta.title}</h2>
          <p className="text-slate-600 dark:text-slate-500 max-w-3xl mx-auto mb-16 text-xl leading-relaxed font-normal">
            {section.cta.description}
          </p>
          <div className="flex justify-center flex-wrap gap-12 opacity-50 grayscale">
             {section.cta.cities.map((city) => (
               <div key={city} className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white">{city}</div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAboutPage;
