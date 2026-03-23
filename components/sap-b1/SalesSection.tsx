import React from 'react';
import { SectionHeader, FeatureCard } from './SapB1UI';
import { Smile } from 'lucide-react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const SalesSection: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.sales;
  return (
    <div className="py-24 bg-[#fff0f5] dark:bg-[#1a050b] relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 relative z-10">
        <SectionHeader 
          title={section.title} 
          subtitle={section.subtitle} 
          colorClass="text-pink-600 dark:text-pink-400" 
        />
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-full min-h-[450px] bg-pink-100 dark:bg-pink-900/20 rounded-[3rem] flex items-center justify-center p-12 shadow-inner">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 border-4 border-pink-400 rounded-full opacity-20 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-6 border-4 border-pink-400 rounded-full opacity-40 animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Smile className="w-28 h-28 text-pink-500" strokeWidth={1} />
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {section.description}
            </p>
            <div className="grid gap-8">
              {section.featureCards.map((card) => {
                const Icon = resolveIcon(card.icon);
                return <FeatureCard key={card.title} icon={<Icon className="w-7 h-7" />} title={card.title} desc={card.description} color="bg-pink-500" />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSection;
