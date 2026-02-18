import { motion } from 'framer-motion';

interface PreloaderProps {
  progress: number;
}

export function Preloader({ progress }: PreloaderProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Blinking logo */}
      <motion.img
        src="/logo_white.png"
        alt="IZZAMUZZIC"
        className="h-12 mb-8"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[--color-accent]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Percentage */}
      <p className="text-[#a0a0a0] text-sm mt-4">{Math.round(progress)}%</p>
    </div>
  );
}
