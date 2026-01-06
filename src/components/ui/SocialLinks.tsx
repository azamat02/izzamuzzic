import { motion } from 'framer-motion';
import { socials } from '../../data/socials';

interface SocialLinksProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SocialLinks({ size = 'md', className = '' }: SocialLinksProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socials.map((social, index) => (
        <motion.a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${sizes[size]} text-[#a0a0a0] hover:text-[#e63946] transition-colors duration-300`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.2 }}
          aria-label={social.name}
        >
          <social.icon />
        </motion.a>
      ))}
    </div>
  );
}
