
import React from 'react';
import Logo from './Logo';

interface LoadingScreenProps {
  isFadingOut?: boolean;
  transformStyle?: React.CSSProperties;
  theme?: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFadingOut, transformStyle, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center font-sans overflow-hidden ${isFadingOut ? 'pointer-events-none' : ''}`}>
      <style>{`
        .loading-bg {
          transition: opacity 1000ms cubic-bezier(0.7, 0, 0.3, 1);
          background: ${isDark ? '#020617' : '#fbfbfd'};
        }

        .loading-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, ${isDark ? 'rgba(58, 123, 213, 0.08)' : 'rgba(22, 35, 63, 0.04)'} 0%, transparent 70%);
          animation: bgPulse 6s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .logo-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          transform-origin: top left;
          transition: transform 900ms cubic-bezier(0.76, 0, 0.24, 1), opacity 600ms ease-out;
          will-change: transform, opacity;
        }

        .logo-pulse {
          animation: logoPulse 2.5s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.97); opacity: 0.9; }
        }

        .loading-bar-container {
          width: 140px;
          height: 1.5px;
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          border-radius: 99px;
          overflow: hidden;
          opacity: ${isFadingOut ? 0 : 1};
          transition: opacity 400ms ease-out;
        }

        .loading-bar-fill {
          height: 100%;
          width: 40%;
          background: ${isDark ? '#cb9b42' : '#001e46'};
          border-radius: 99px;
          animation: loadingBar 2s ease-in-out infinite;
        }

        @keyframes loadingBar {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

      <div className={`loading-bg absolute inset-0 w-full h-full ${isFadingOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}></div>

      <div
        id="loading-logo-source"
        className={`logo-wrapper ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
        style={transformStyle}
      >
        <div className={!transformStyle ? 'logo-pulse' : ''}>
           <Logo theme={theme} className="w-[160px] sm:w-[200px] lg:w-[240px] h-auto" />
        </div>
        
        {!transformStyle && (
          <div className="loading-bar-container">
            <div className="loading-bar-fill"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
