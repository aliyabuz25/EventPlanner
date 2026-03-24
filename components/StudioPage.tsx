import React from 'react';
import ErpAdvisor from './ErpAdvisor';

const StudioPage: React.FC = () => {
  return (
    <div className="bg-sap-paper dark:bg-[#050505] pt-24 sm:pt-28 pb-10 sm:pb-16 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="p-0">
          <ErpAdvisor embedded />
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
