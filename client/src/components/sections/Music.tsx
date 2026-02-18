import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { usePublicData } from '../../hooks/useApi';
import { getIcon } from '../../lib/iconMap';

const platformHoverColors: Record<string, string> = {
  FaSpotify: 'hover:bg-[#1DB954] hover:border-[#1DB954]',
  FaYoutube: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
  SiApplemusic: 'hover:bg-[#FA243C] hover:border-[#FA243C]',
  FaSoundcloud: 'hover:bg-[#FF5500] hover:border-[#FF5500]',
  FaDeezer: 'hover:bg-[#A238FF] hover:border-[#A238FF]',
  SiTidal: 'hover:bg-[#000000] hover:border-[#ffffff]/30',
  FaBandcamp: 'hover:bg-[#1DA0C3] hover:border-[#1DA0C3]',
  FaYandex: 'hover:bg-[#FFCC00] hover:border-[#FFCC00]',
};

interface ReleaseLink {
  id: number;
  releaseId: number;
  platform: string;
  url: string;
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
            className="group flex flex-col items-center gap-6 max-w-3xl mx-auto"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-72 h-72 md:w-80 md:h-80 overflow-hidden rounded-lg">
                <img
                  src={release.cover}
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{release.title}</h3>
                <p className="text-[#a0a0a0] text-sm uppercase tracking-wider">
                  {release.type} • {release.year}
                </p>
              </div>
              <div className="flex gap-3">
                {(release.links || []).map((link) => {
                  const Icon = getIcon(link.platform);
                  const hoverColor = platformHoverColors[link.platform] || 'hover:bg-white/10 hover:border-white/30';
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center w-10 h-10 border border-transparent text-white rounded-full transition-all duration-300 ${hoverColor}`}
                    >
                      <Icon className="text-lg" />
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
