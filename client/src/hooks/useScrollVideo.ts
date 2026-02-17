import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => setIsReady(true);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    if (video.readyState >= 4) setIsReady(true);

    return () => video.removeEventListener('canplaythrough', handleCanPlayThrough);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (videoRef.current && isReady) {
      const duration = videoRef.current.duration;
      if (duration && !isNaN(duration)) {
        videoRef.current.currentTime = progress * duration;
      }
    }
  });

  return { videoRef, containerRef, isReady };
}
