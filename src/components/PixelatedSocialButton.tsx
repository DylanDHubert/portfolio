import React from 'react';
import PixelatedIcon from './PixelatedIcon';
import styles from './about/about.module.scss';

interface PixelatedSocialButtonProps {
  type: 'github' | 'linkedin' | 'email' | 'discord' | 'x' | 'threads';
  href: string;
  tooltip?: string;
  size?: number;
}

const PixelatedSocialButton: React.FC<PixelatedSocialButtonProps> = ({ 
  type, 
  href, 
  tooltip, 
  size = 24 
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={tooltip}
      className={styles.socialIcon}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size + 16}px`,
        height: `${size + 16}px`,
        textDecoration: 'none',
      }}
    >
      <PixelatedIcon type={type} size={size} />
    </a>
  );
};

export default PixelatedSocialButton; 