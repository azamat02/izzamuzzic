import { motion } from 'framer-motion';
import { usePublicData } from '../../hooks/useApi';
import { getIcon } from '../../lib/iconMap';

interface SocialLink {
  id: number;
  name: string;
  url: string;
  iconKey: string;
  sortOrder: number;
}

interface SocialLinksProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SocialLinks({ size = 'md', className = '' }: SocialLinksProps) {
  const { data: socials } = usePublicData<SocialLink[]>('socials', '/socials');

  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  if (!socials) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socials.map((social, index) => {
        const Icon = getIcon(social.iconKey);
        return (
          <motion.a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizes[size]} text-white hover:text-[#e63946] transition-colors duration-300`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.2 }}
            aria-label={social.name}
          >
            <Icon />
          </motion.a>
        );
      })}
    </div>
  );
}
