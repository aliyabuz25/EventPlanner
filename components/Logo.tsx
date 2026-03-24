
import React from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';

interface LogoProps {
  theme?: 'light' | 'dark';
  scrolled?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme = 'dark', scrolled = false, className = "h-10 sm:h-12 w-auto" }) => {
  const { content } = useSiteContent();
  const logoUrl = content.global?.branding?.logoUrl;
  const resolvedClassName = `${className} block shrink-0`;

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={content.global?.company?.name || 'Site logo'}
        className={resolvedClassName}
        loading="eager"
        decoding="sync"
        fetchPriority="high"
        referrerPolicy="no-referrer"
        style={{ imageRendering: 'auto' }}
      />
    );
  }

  return (
    <svg viewBox="0 0 420 160" className={resolvedClassName} preserveAspectRatio="xMidYMid meet">
      <defs>
          <linearGradient id="logo_blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#3498db', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#2980b9', stopOpacity:1}} />
          </linearGradient>
          
          <linearGradient id="logo_orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#e74c3c', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ff6b4a', stopOpacity:1}} />
          </linearGradient>
          
          <linearGradient id="logo_textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: theme === 'dark' || !scrolled ? '#95a5a6' : '#475569', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor: theme === 'dark' || !scrolled ? '#bdc3c7' : '#64748b', stopOpacity:1}} />
          </linearGradient>
          
          <filter id="logo_glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
              </feMerge>
          </filter>
      </defs>
      
      <g transform="translate(-120, -60)">
        <g filter={theme === 'dark' ? "url(#logo_glow)" : ""}>
            <path d="M 130 70 
                    L 180 70 
                    Q 195 70, 195 85
                    Q 195 95, 185 100
                    L 175 100
                    L 185 100
                    Q 200 105, 200 120
                    Q 200 140, 180 140
                    L 130 140
                    L 135 130
                    L 175 130
                    Q 185 130, 185 120
                    Q 185 110, 175 110
                    L 150 110
                    L 150 100
                    L 175 100
                    Q 185 100, 185 90
                    Q 185 80, 175 80
                    L 135 80
                    Z" 
                  fill="url(#logo_blueGradient)" 
                  stroke="#3498db" 
                  strokeWidth="2"/>
        </g>
        
        <g transform="translate(235, 80)">
            <polygon points="0,-25 22,-12 22,12 0,25 -22,12 -22,-12" 
                    fill="url(#logo_orangeGradient)" 
                    stroke="#e74c3c" 
                    strokeWidth="2"
                    opacity="0.9">
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="20s" repeatCount="indefinite"/>
            </polygon>
            <circle cx="35" cy="0" r="4" fill="#ff6b4a" opacity="0.8">
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
            </circle>
        </g>

        <g>
            <rect x="205" y="150" width="20" height="55" rx="10" fill="url(#logo_blueGradient)" opacity="0.9">
                <animate attributeName="height" values="55;65;55" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="150;140;150" dur="2s" repeatCount="indefinite"/>
            </rect>
        </g>
        <g>
            <rect x="228" y="125" width="20" height="80" rx="10" fill="url(#logo_blueGradient)" opacity="0.95">
                <animate attributeName="height" values="80;90;80" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="y" values="125;115;125" dur="2.5s" repeatCount="indefinite"/>
            </rect>
        </g>
        <g>
            <rect x="251" y="137" width="20" height="68" rx="10" fill="url(#logo_blueGradient)" opacity="0.92">
                <animate attributeName="height" values="68;78;68" dur="2.2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="137;127;137" dur="2.2s" repeatCount="indefinite"/>
            </rect>
        </g>
        
        <text x="280" y="145" 
              fontFamily="'Orbitron', monospace" 
              fontSize="80" 
              fontWeight="700" 
              fill="url(#logo_textGradient)"
              letterSpacing="2">line</text>

        <circle cx="505" cy="120" r="3" fill="#3498db" opacity="0.6"/>
        <circle cx="515" cy="125" r="2" fill="#e74c3c" opacity="0.6"/>
        <circle cx="525" cy="118" r="2.5" fill="#3498db" opacity="0.6"/>
      </g>
    </svg>
  );
};

export default Logo;
