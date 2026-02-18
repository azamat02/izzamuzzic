import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { usePublicData } from '../../hooks/useApi';
import { getIcon } from '../../lib/iconMap';

const defaultPlatformColors: Record<string, string> = {
  FaSpotify: '#1DB954',
  FaYoutube: '#FF0000',
  SiApplemusic: '#FA243C',
  FaSoundcloud: '#FF5500',
  FaDeezer: '#A238FF',
  SiTidal: '#000000',
  FaBandcamp: '#1DA0C3',
  FaYandex: '#FFCC00',
};

interface ReleaseLink {
  id: number;
  releaseId: number;
  platform: string;
  url: string;
  hoverColor: string | null;
  sortOrder: number;
}

interface Release {
  id: number;
  title: string;
  type: string;
  year: number;
  cover: string;
  sortOrder: number;
  links: ReleaseLink[];
}

interface MusicSettings {
  id: number;
  subtitle: string;
  spotifyEmbedUrl: string;
}

export function Music() {
  const { data: releases } = usePublicData<Release[]>('releases', '/releases');
  const { data: settings } = usePublicData<MusicSettings>('music-settings', '/music-settings');

  return (
    <section id="music" className="py-24 bg-[#0a0a0a] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="MUSIC"
          subtitle={settings?.subtitle || 'Latest releases and tracks'}
        />

        {(releases || []).slice(0, 1).map((release) => (
          <motion.div
            key={release.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group flex flex-col md:flex-row items-center md:items-start gap-10 max-w-3xl mx-auto mb-8"
          >
            <div className="shrink-0 relative mb-12 md:mb-10">
              <div className="relative w-72 h-72 md:w-80 md:h-80 overflow-hidden rounded-lg">
                <img
                  src={release.cover}
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 flex gap-3">
                {(release.links || []).map((link) => {
                  const Icon = getIcon(link.platform);
                  const color = link.hoverColor || defaultPlatformColors[link.platform] || '#ffffff';
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 border border-transparent text-white rounded-full transition-all duration-300 hover:scale-110"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = color;
                        e.currentTarget.style.borderColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <Icon className="text-lg" />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="text-center md:text-left md:h-80 md:flex md:flex-col md:justify-center">
              <h3 className="text-white font-bold text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{release.title}</h3>
              <p className="text-[#a0a0a0] text-sm uppercase tracking-wider">
                {release.type} • {release.year}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
