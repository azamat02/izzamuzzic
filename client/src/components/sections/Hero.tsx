import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface HeroData {
  id: number;
  videoUrl: string;
}

export function Hero() {
  const { data: heroSettings } = useQuery({
    queryKey: ['hero-settings'],
    queryFn: () => api.get<HeroData | null>('/hero-settings'),
    staleTime: 5 * 60 * 1000,
  });

  const videoSrc = heroSettings?.videoUrl || '/hero-video.mp4';

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#282828]">
      {/* Background video */}
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Bottom gradient — smooth transition to the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

      {/* Scroll indicator — bottom right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 right-12 max-lg:right-6"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-[45px] h-[45px] border border-white/60 rounded-full flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
