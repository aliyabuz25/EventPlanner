import React from 'react';
import { SectionHeader, FeatureCard } from './SapB1UI';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const PurchasingSection: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.purchasing;
  return (
    <div className="py-24 bg-[#fff7ed] dark:bg-[#1a0f05] relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeader 
          title={section.title} 
          subtitle={section.subtitle} 
          colorClass="text-orange-600 dark:text-orange-400" 
        />
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {section.description}
            </p>
            <div className="grid gap-8">
              {section.featureCards.map((card) => {
                const Icon = resolveIcon(card.icon);
                return <FeatureCard key={card.title} icon={<Icon className="w-7 h-7" />} title={card.title} desc={card.description} color="bg-orange-500" />;
              })}
            </div>
          </div>
          <div className="relative h-full min-h-[450px] bg-orange-100 dark:bg-orange-900/20 rounded-[3rem] flex items-center justify-center p-12 shadow-inner">
            <div className="space-y-6 w-72">
              <div className="h-20 bg-white dark:bg-orange-800 rounded-2xl shadow-xl border-l-[12px] border-orange-500 transform translate-x-6 hover:translate-x-0 transition-transform duration-500"></div>
              <div className="h-20 bg-white dark:bg-orange-800 rounded-2xl shadow-xl border-l-[12px] border-orange-400 hover:scale-105 transition-transform duration-500"></div>
              <div className="h-20 bg-white dark:bg-orange-800 rounded-2xl shadow-xl border-l-[12px] border-orange-300 transform -translate-x-6 hover:translate-x-0 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasingSection;
