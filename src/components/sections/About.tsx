import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';

export function About() {
  return (
    <section id="about" className="py-24 bg-[#141414] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="ABOUT"
          subtitle="The story behind the sound"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src="https://placehold.co/600x750/141414/e63946?text=Artist+Photo"
                alt="IZZAMUZZIC"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-[#e63946] rounded-lg -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-[#a0a0a0] text-lg leading-relaxed">
              IZZAMUZZIC is an electronic music producer and DJ known for creating
              atmospheric soundscapes that blend deep bass, haunting melodies, and
              cinematic textures.
            </p>
            <p className="text-[#a0a0a0] text-lg leading-relaxed">
              With releases on major labels and millions of streams across platforms,
              IZZAMUZZIC has established a unique sonic identity that resonates with
              listeners worldwide.
            </p>
            <p className="text-[#a0a0a0] text-lg leading-relaxed">
              From intimate club sets to major festival stages, the live performances
              deliver an immersive experience that takes audiences on a journey through
              sound and emotion.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <p className="text-4xl text-[#e63946]" style={{ fontFamily: 'var(--font-heading)' }}>10M+</p>
                <p className="text-[#a0a0a0] text-sm uppercase">Streams</p>
              </div>
              <div className="text-center">
                <p className="text-4xl text-[#e63946]" style={{ fontFamily: 'var(--font-heading)' }}>50+</p>
                <p className="text-[#a0a0a0] text-sm uppercase">Releases</p>
              </div>
              <div className="text-center">
                <p className="text-4xl text-[#e63946]" style={{ fontFamily: 'var(--font-heading)' }}>20+</p>
                <p className="text-[#a0a0a0] text-sm uppercase">Countries</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
