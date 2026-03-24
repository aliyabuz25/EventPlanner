
import React from 'react';
import { useSiteContent } from '../contexts/SiteContentContext';

const DEFAULT_FASTLANE_LOGO_URL = 'https://image.jimcdn.com/app/cms/image/transf/dimension=200x10000:format=png/path/s610c0f1f85cf6198/image/i4680b6c988b29d66/version/1715170961/image.png';

interface LogoProps {
  theme?: 'light' | 'dark';
  scrolled?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ theme = 'dark', scrolled = false, className = "h-10 sm:h-12 w-auto" }) => {
  const { content } = useSiteContent();
  const logoUrl = content.global?.branding?.logoUrl || DEFAULT_FASTLANE_LOGO_URL;
  const resolvedClassName = `${className} block shrink-0`;

  return (
    <img
      src={logoUrl}
      alt={content.global?.company?.name || 'FastLane logo'}
      className={resolvedClassName}
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      style={{ imageRendering: 'auto' }}
    />
  );
};

export default Logo;
