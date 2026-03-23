import React from 'react';
import Logo from './Logo';

interface LoadingScreenProps {
  isFadingOut?: boolean;
  transformStyle?: React.CSSProperties;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFadingOut, transformStyle }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans overflow-hidden pointer-events-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&family=Orbitron:wght@400;700;900&display=swap');

        .loading-bg {
          transition: opacity 800ms ease-out;
        }

        .loading-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #0a0e27;
          z-index: -1;
        }

        .loading-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 50%, rgba(41, 128, 185, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(231, 76, 60, 0.08) 0%, transparent 50%);
          animation: bgPulse 8s ease-in-out infinite;
          z-index: 0;
        }

        @keyframes bgPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .logo-container {
          position: relative;
          z-index: 10;
          text-align: center;
          transform-origin: top left;
          animation: ${transformStyle ? 'none' : 'fadeIn 1.2s ease-out'};
          transition: transform 800ms cubic-bezier(0.76, 0, 0.24, 1);
          will-change: transform;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

      `}</style>

      <div className={`loading-bg absolute inset-0 w-full h-full ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}></div>

      <div
        id="loading-logo-source"
        className="logo-container px-4"
        style={transformStyle}
      >
        <Logo theme="dark" className="w-[600px] max-w-full h-auto" />
      </div>
    </div>
  );
};

export default LoadingScreen;
