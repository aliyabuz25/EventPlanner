
import React from 'react';

interface AIFinderButtonProps {
  onClick: () => void;
}

const AIFinderButton: React.FC<AIFinderButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center space-x-2 px-4 py-2.5 rounded-full border border-violet-200/80 bg-white/80 hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] transition-all duration-300 shadow-sm"
    >
      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-pulse drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
      
      <span className="text-sm font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 group-hover:from-violet-500 group-hover:to-indigo-500">
        AI Explorer
      </span>
    </button>
  );
};

export default AIFinderButton;
