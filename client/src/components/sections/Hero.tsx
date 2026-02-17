import { motion } from 'framer-motion';
import { useScrollFrames } from '../../hooks/useScrollFrames';

const TOTAL_FRAMES = 121;

export function Hero() {
  const { containerRef, canvasRef } = useScrollFrames(TOTAL_FRAMES, '/frames');

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Canvas for frame rendering */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-[#a0a0a0] rounded-full flex justify-center"
        >
          <motion.div className="w-1 h-3 bg-[#a0a0a0] rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
}
