
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
      className="group p-8 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-sap-blue dark:hover:border-[#008FD3] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
    >
      <div className="w-14 h-14 rounded-xl bg-sap-blue/10 dark:bg-[#008FD3]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <IconComponent className="w-7 h-7 text-sap-blue dark:text-[#008FD3]" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-sap-gold dark:group-hover:text-sap-gold transition-colors">
        {service.title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {service.description}
      </p>
    </div>
  );
};

export default ServiceCard;
