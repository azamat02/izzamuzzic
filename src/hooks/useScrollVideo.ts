import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollVideo(smoothness = 0.15) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Wait for video to be fully loaded
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlayThrough = () => {
      console.log('Video ready, duration:', video.duration);
      setIsReady(true);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration);
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // If already ready
    if (video.readyState >= 4) {
      setIsReady(true);
    }

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Direct video time update (no lerp)
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
