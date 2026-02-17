import { useRef, useEffect, useState, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollFrames(totalFrames: number, basePath: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Preload all images into memory
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, '0');
      img.src = `${basePath}/frame_${frameNum}.jpg`;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          imagesRef.current = images;
          setImagesLoaded(true);
        }
      };

      images.push(img);
    }
  }, [totalFrames, basePath]);

  // Draw frame on canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex];

    if (canvas && ctx && img) {
      // Set canvas size to match container
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Draw image covering the canvas (like object-fit: cover)
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth, drawHeight, drawX, drawY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  }, []);

  // Draw initial frame when loaded
  useEffect(() => {
    if (imagesLoaded) {
      drawFrame(0);
    }
  }, [imagesLoaded, drawFrame]);

  // Update frame based on scroll
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const frameIndex = Math.min(
      Math.max(Math.round(progress * (totalFrames - 1)), 0),
      totalFrames - 1
    );
    setCurrentFrame(frameIndex + 1);

    if (imagesLoaded) {
      drawFrame(frameIndex);
    }
  });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (imagesLoaded) {
        drawFrame(currentFrame - 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded, currentFrame, drawFrame]);

  return { containerRef, canvasRef, imagesLoaded };
}
