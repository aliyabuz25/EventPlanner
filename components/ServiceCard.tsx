
import React from 'react';
import { Service } from '../types';
import { resolveIcon } from './iconRegistry';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index }) => {
  const IconComponent = resolveIcon(service.icon);

  return (
    <div 
      className="group p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-300 dark:border-white/15 hover:border-sap-blue dark:hover:border-[#008FD3] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-sm"
    >
      <div className="w-16 h-16 rounded-2xl bg-sap-blue/10 dark:bg-[#008FD3]/10 flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
        <IconComponent className="w-8 h-8 text-sap-blue dark:text-[#008FD3]" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-sap-gold dark:group-hover:text-sap-gold transition-colors tracking-tight uppercase italic">
        {service.title}
      </h3>
      <p className="text-slate-700 dark:text-slate-300 text-lg font-bold leading-relaxed">
        {service.description}
      </p>
    </div>
  );
};

export default ServiceCard;
