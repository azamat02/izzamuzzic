import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube } from 'react-icons/fa';
import { SectionTitle } from '../ui/SectionTitle';
import { releases, spotifyEmbedUrl } from '../../data/releases';

export function Music() {
  return (
    <section id="music" className="py-24 bg-[#0a0a0a] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="MUSIC"
          subtitle="Latest releases and tracks"
        />

        {/* Spotify Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <iframe
            src={spotifyEmbedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
          />
        </motion.div>

        {/* Releases Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {releases.map((release, index) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                <img
                  src={release.cover}
                  alt={release.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  {release.spotifyUrl && (
                    <a
                      href={release.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-3xl hover:text-[#e63946] transition-colors"
                    >
                      <FaSpotify />
                    </a>
                  )}
                  {release.youtubeUrl && (
                    <a
                      href={release.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-3xl hover:text-[#e63946] transition-colors"
                    >
                      <FaYoutube />
                    </a>
                  )}
                </div>
              </div>
              <h3 className="text-white font-medium text-lg">{release.title}</h3>
              <p className="text-[#a0a0a0] text-sm uppercase">
                {release.type} • {release.year}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
