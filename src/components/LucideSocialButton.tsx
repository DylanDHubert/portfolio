import React from 'react';
import { Github, Linkedin, Mail, MessageCircle, Twitter } from 'lucide-react';
import styles from './about/about.module.scss';

interface LucideSocialButtonProps {
  type: 'github' | 'linkedin' | 'email' | 'discord' | 'x' | 'threads';
  href: string;
  tooltip?: string;
  size?: number;
}

const LucideSocialButton: React.FC<LucideSocialButtonProps> = ({ 
  type, 
  href, 
  tooltip, 
  size = 24 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'github':
        return <Github size={size} />;
      case 'linkedin':
        return <Linkedin size={size} />;
      case 'email':
        return <Mail size={size} />;
      case 'discord':
        return <MessageCircle size={size} />;
      case 'x':
        return <Twitter size={size} />;
      case 'threads':
        return <Twitter size={size} />; // Using Twitter icon for threads as placeholder
      default:
        return null;
    }
  };

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
      {getIcon()}
    </a>
  );
};

export default LucideSocialButton; 