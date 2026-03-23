import React from 'react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { resolveIcon } from '../iconRegistry';

const InnovationSection: React.FC = () => {
  const { content } = useSiteContent();
  const section = content.pages.sapBusinessOne.sections.innovation;

  return (
    <div className="py-32 bg-[#0f172a] text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-24 items-center relative z-10">
        <div className="animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-flex items-center px-4 py-2 bg-sap-gold/10 border border-sap-gold/20 rounded-full text-sap-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
            {React.createElement(resolveIcon(section.items[0]?.icon), { className: 'w-3 h-3 mr-2' })}
            {section.badge}
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
            {section.title[0]} <br /> {section.title[1]}
          </h2>
          <p className="text-xl text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
            {section.description}
          </p>
          <div className="space-y-10">
            {section.items.map((item, index) => {
              const Icon = resolveIcon(item.icon);
              const accentClass = index === 0 ? 'text-sap-gold group-hover:text-sap-gold' : 'text-emerald-500 group-hover:text-emerald-500';

              return (
                <div key={item.title} className="flex items-start space-x-6 group">
                  <div className={`w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 ${accentClass.split(' ')[0]} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-xl mb-2 transition-colors ${accentClass}`}>
                      {item.title}
                    </h4>
                    <p className="text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          {/* Visual Representation of AI */}
          <div className="relative w-full aspect-square max-w-lg">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 animate-pulse blur-3xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-16 border border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-2xl shadow-2xl transform hover:scale-105 transition-transform duration-700">
                <div className="text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white to-white/20">AI</div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{section.visualLabel}</div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-12 h-12 bg-blue-500/20 rounded-xl blur-xl animate-bounce"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnovationSection;
