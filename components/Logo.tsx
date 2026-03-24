
import React from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';

const DEFAULT_FASTLANE_LOGO_URL = 'https://image.jimcdn.com/app/cms/image/transf/dimension=200x10000:format=png/path/s610c0f1f85cf6198/image/i4680b6c988b29d66/version/1715170961/image.png';

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
  const rawLogoUrl = content.global?.branding?.logoUrl || DEFAULT_FASTLANE_LOGO_URL;
  
  // Professional Upscale: Enhance resolution via CDN query parameters
  const logoUrl = rawLogoUrl.includes('jimcdn.com') 
    ? rawLogoUrl.replace('dimension=200x', 'dimension=600x')
    : rawLogoUrl;

  const resolvedClassName = `${className} block shrink-0 select-none transition-all duration-500`;

  return (
    <img
      src={logoUrl}
      alt={content.global?.company?.name || 'FastLane logo'}
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
