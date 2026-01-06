import { useRef, useEffect, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollFrames(totalFrames: number, basePath: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      const promises = [];
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(4, '0');
        img.src = `${basePath}/frame_${frameNum}.jpg`;
        promises.push(
          new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
        );
      }
      await Promise.all(promises);
      console.log(`Loaded ${totalFrames} frames`);
      setImagesLoaded(true);
    };

    preloadImages();
  }, [totalFrames, basePath]);

  // Update frame based on scroll
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const frame = Math.min(
      Math.max(Math.round(progress * (totalFrames - 1)) + 1, 1),
      totalFrames
    );
    setCurrentFrame(frame);
  });

  const currentFrameSrc = `${basePath}/frame_${String(currentFrame).padStart(4, '0')}.jpg`;

  return { containerRef, currentFrame, currentFrameSrc, imagesLoaded };
}
