import React from 'react';
import { SectionHeader, FeatureCard } from './SapB1UI';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const ProductionSection: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.production;
  return (
    <div className="py-24 bg-[#f3e8ff] dark:bg-[#10051a] relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeader 
          title={section.title} 
          subtitle={section.subtitle} 
          colorClass="text-purple-600 dark:text-purple-400" 
        />
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-full min-h-[450px] bg-purple-100 dark:bg-purple-900/20 rounded-[3rem] flex items-center justify-center p-12 shadow-inner">
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-28 h-28 bg-white dark:bg-purple-800 rounded-3xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-500 border border-purple-100 dark:border-purple-700">
                  <div className={`w-14 h-14 bg-purple-${i * 100 + 100} rounded-2xl opacity-80`}></div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {section.description}
            </p>
            <div className="grid gap-8">
              {section.featureCards.map((card) => {
                const Icon = resolveIcon(card.icon);
                return <FeatureCard key={card.title} icon={<Icon className="w-7 h-7" />} title={card.title} desc={card.description} color="bg-purple-500" />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSection;
