
import React from 'react';
import ServiceCard from './ServiceCard';
import { useSiteContent } from '../contexts/SiteContentContext';

interface ServicesProps {
  onExplore?: () => void;
}

const Services: React.FC<ServicesProps> = ({ onExplore }) => {
  const { content } = useSiteContent();
  const section = content.pages.home.sections.services;

  return (
    <section id="services" className="py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-sap-blue dark:text-[#008FD3] uppercase tracking-[0.2em] mb-4">{section.eyebrow}</h2>
            <p className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              {section.title}
            </p>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-md text-lg">
            {section.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.items.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        <div className="mt-20 p-10 bg-[#f8fafc] dark:bg-[#121212] border-l-4 border-[#008FD3] flex flex-col lg:flex-row items-center justify-between gap-12 rounded-r-lg shadow-xl dark:shadow-xl transition-colors">
          <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white transition-colors">{section.cta.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base transition-colors">{section.cta.description}</p>
          </div>
          <a
            href={section.cta.buttonHref}
            onClick={onExplore}
            className="px-8 py-3 bg-[#008FD3] text-white font-semibold text-sm hover:bg-[#007db8] transition-all rounded-md shadow-lg whitespace-nowrap"
          >
            {section.cta.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
