import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { usePublicData } from '../../hooks/useApi';
import { getIcon, platformOptions } from '../../lib/iconMap';

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
            className="group flex flex-col md:flex-row items-center gap-10 max-w-3xl mx-auto"
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80 shrink-0 overflow-hidden rounded-lg">
              <img
                src={release.cover}
                alt={release.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                {(release.links || []).map((link) => {
                  const Icon = getIcon(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-4xl hover:text-[#ff3c00] transition-colors"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{release.title}</h3>
              <p className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-6">
                {release.type} • {release.year}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {(release.links || []).map((link, index) => {
                  const Icon = getIcon(link.platform);
                  const label = platformOptions.find(p => p.key === link.platform)?.label || 'Link';
                  const isPrimary = index === 0;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        isPrimary
                          ? 'flex items-center gap-2 bg-[#e63946] text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-110 transition'
                          : 'flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition'
                      }
                    >
                      <Icon className="text-lg" /> {label}
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
