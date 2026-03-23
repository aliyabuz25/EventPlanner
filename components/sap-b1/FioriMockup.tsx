import React from 'react';
import { useSiteContent } from '../../contexts/SiteContentContext';

const FioriMockup: React.FC = () => {
  const { content } = useSiteContent();
  const mockup = content.pages.sapBusinessOne.sections.webInterface.mockup;
  const inventoryBars = mockup.inventoryBars.map((value) => Number(value));

  return (
    <div className="bg-slate-100 dark:bg-[#121212] p-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 group">
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden flex flex-col shadow-inner transition-transform duration-700 group-hover:scale-[1.01]">
        {/* Top Bar */}
        <div className="h-14 bg-[#354a5f] flex items-center px-6 justify-between border-b border-black/10">
          <div className="text-white font-bold text-sm tracking-wide flex items-center">
            <span className="bg-white text-[#354a5f] px-1.5 py-0.5 rounded mr-2 text-[10px]">{mockup.brandLabel}</span>
            <span className="font-normal opacity-90">{mockup.productLabel}</span>
          </div>
          <div className="flex space-x-4">
            <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"></div>
            <div className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"></div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="p-6 grid grid-cols-2 gap-6 bg-slate-50 dark:bg-[#0e1621] transition-colors">
          <div className="col-span-2 flex items-center justify-between mb-2">
            <h4 className="text-xl font-light text-slate-700 dark:text-white">{mockup.dashboardTitle}</h4>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{mockup.updatedLabel}</div>
          </div>
          
          {/* Tile 1 */}
          <div className="bg-white dark:bg-[#252525] p-5 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 h-36 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{mockup.salesOrdersLabel}</div>
            <div className="text-4xl font-light text-slate-800 dark:text-white">{mockup.salesOrdersValue}</div>
            <div className="flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              {mockup.salesOrdersStatus}
            </div>
          </div>
          
          {/* Tile 2 */}
          <div className="bg-white dark:bg-[#252525] p-5 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 h-36 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{mockup.revenueLabel}</div>
            <div className="text-4xl font-light text-slate-800 dark:text-white">{mockup.revenueValue}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <span>{mockup.targetLabel}</span>
                <span>{mockup.targetValue}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-sap-blue rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Tile 3 (Wide) */}
          <div className="col-span-2 bg-white dark:bg-[#252525] p-5 rounded-xl shadow-sm border border-slate-200 dark:border-white/5 h-44 hover:shadow-md transition-shadow">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-6">{mockup.inventoryLabel}</div>
            <div className="flex items-end justify-between h-24 space-x-3 px-2">
              {inventoryBars.map((h, i) => (
                <div 
                  key={i} 
                  className="w-full bg-sap-blue/30 hover:bg-sap-blue transition-all duration-500 rounded-t-lg cursor-pointer group/bar relative" 
                  style={{height: `${h}%`}}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                    Value: {h}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FioriMockup;
