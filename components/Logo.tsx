
import React from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';

interface LogoProps {
  theme?: 'light' | 'dark';
  scrolled?: boolean;
  className?: string;
  imgStyle?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({
  theme = 'light',
  className = "h-10 sm:h-12 w-auto",
  imgStyle,
}) => {
  const { content } = useSiteContent();
  const companyName = content.global?.company?.name || 'Site';
  const rawLogoUrl = content.global?.branding?.logoUrl || '';
  
  // Professional Upscale: Enhance resolution via CDN query parameters
  const logoUrl = rawLogoUrl.includes('jimcdn.com') 
    ? rawLogoUrl.replace('dimension=200x', 'dimension=600x')
    : rawLogoUrl;

  const resolvedClassName = `${className} block shrink-0 select-none transition-all duration-500`;

  if (!logoUrl) {
    return (
      <span
        className={`${resolvedClassName} inline-flex items-center text-lg font-black tracking-[0.22em] text-slate-900 dark:text-white`}
        style={imgStyle}
      >
        {companyName}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${companyName} logo`}
      className={resolvedClassName}
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      style={{ 
        imageRendering: 'high-quality',
        // Pro-grade theme adaptation for monochrome or semi-monochrome logos
        filter: theme === 'dark' 
          ? 'brightness(0) invert(1) drop-shadow(0 0 1px rgba(255,255,255,0.1))' 
          : 'contrast(1.05) saturate(1.1)',
        ...imgStyle 
      }}
    />
  );
};

export default Logo;
