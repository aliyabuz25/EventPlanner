import React from 'react';
import { SectionHeader, FeatureCard } from './SapB1UI';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const FinancialsSection: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.financials;
  return (
    <div className="py-24 bg-[#e6fcf5] dark:bg-[#061814] relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeader 
          title={section.title} 
          subtitle={section.subtitle} 
          colorClass="text-emerald-600 dark:text-emerald-400" 
        />
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {section.description}
            </p>
            <div className="grid gap-8">
              {section.featureCards.map((card) => {
                const Icon = resolveIcon(card.icon);
                return <FeatureCard key={card.title} icon={<Icon className="w-7 h-7" />} title={card.title} desc={card.description} color="bg-emerald-500" />;
              })}
            </div>
          </div>
          <div className="relative h-full min-h-[450px] bg-emerald-100 dark:bg-emerald-900/20 rounded-[3rem] flex items-center justify-center p-12 shadow-inner">
            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
              {section.statCards.map((card, index) => (
                <div key={card.label} className={`bg-white dark:bg-emerald-800 p-8 rounded-[2rem] shadow-2xl ${index % 2 === 0 ? 'transform rotate-3' : 'transform -rotate-3 mt-12'} hover:rotate-0 transition-transform duration-500 border border-emerald-100 dark:border-emerald-700`}>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">{card.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-emerald-200">{card.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialsSection;
