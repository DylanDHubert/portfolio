import React from 'react';
import PixelatedIcon from './PixelatedIcon';

interface PixelatedSocialIconProps {
  type: 'github' | 'linkedin' | 'email' | 'discord' | 'x' | 'threads';
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PixelatedSocialIcon: React.FC<PixelatedSocialIconProps> = ({ 
  type, 
  size = 24, 
  className = '',
  style = {}
}) => {
  return (
    <PixelatedIcon 
      type={type} 
      size={size} 
      className={className}
    />
  );
};

// Export individual icon components for easy use
export const PixelatedGithub = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="github" {...props} />
);

export const PixelatedLinkedin = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="linkedin" {...props} />
);

export const PixelatedEmail = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="email" {...props} />
);

export const PixelatedDiscord = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="discord" {...props} />
);

export const PixelatedX = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="x" {...props} />
);

export const PixelatedThreads = (props: Omit<PixelatedSocialIconProps, 'type'>) => (
  <PixelatedSocialIcon type="threads" {...props} />
);

export default PixelatedSocialIcon; 