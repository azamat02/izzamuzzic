import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { usePublicData } from '../../hooks/useApi';

interface AboutContent {
  id: number;
  photo: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  subtitle: string;
}

export function About() {
  const { data: about } = usePublicData<AboutContent>('about', '/about');

  return (
    <section id="about" className="py-24 bg-[#141414] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="ABOUT"
          subtitle={about?.subtitle || 'The story behind the sound'}
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden">
              <img
                src={about?.photo || 'https://placehold.co/600x750/141414/e63946?text=Artist+Photo'}
                alt="IZZAMUZZIC"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-[--color-accent] rounded-lg -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {about?.paragraph1 && (
              <p className="text-[#a0a0a0] text-lg leading-relaxed">{about.paragraph1}</p>
            )}
            {about?.paragraph2 && (
              <p className="text-[#a0a0a0] text-lg leading-relaxed">{about.paragraph2}</p>
            )}
            {about?.paragraph3 && (
              <p className="text-[#a0a0a0] text-lg leading-relaxed">{about.paragraph3}</p>
            )}

            <div className="grid grid-cols-3 gap-6 pt-8">
              {about?.stat1Value && (
                <div className="text-center">
                  <p className="text-4xl text-[--color-accent]" style={{ fontFamily: 'var(--font-heading)' }}>{about.stat1Value}</p>
                  <p className="text-[#a0a0a0] text-sm uppercase">{about.stat1Label}</p>
                </div>
              )}
              {about?.stat2Value && (
                <div className="text-center">
                  <p className="text-4xl text-[--color-accent]" style={{ fontFamily: 'var(--font-heading)' }}>{about.stat2Value}</p>
                  <p className="text-[#a0a0a0] text-sm uppercase">{about.stat2Label}</p>
                </div>
              )}
              {about?.stat3Value && (
                <div className="text-center">
                  <p className="text-4xl text-[--color-accent]" style={{ fontFamily: 'var(--font-heading)' }}>{about.stat3Value}</p>
                  <p className="text-[#a0a0a0] text-sm uppercase">{about.stat3Label}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
