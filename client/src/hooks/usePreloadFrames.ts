import { useEffect, useState } from 'react';

export function usePreloadFrames(totalFrames: number, basePath: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;

    const preloadImages = async () => {
      const promises = [];
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(4, '0');
        img.src = `${basePath}/frame_${frameNum}.jpg`;
        promises.push(
          new Promise((resolve) => {
            img.onload = () => {
              loadedCount++;
              setProgress((loadedCount / totalFrames) * 100);
              resolve(true);
            };
            img.onerror = () => {
              loadedCount++;
              setProgress((loadedCount / totalFrames) * 100);
              resolve(false);
            };
          })
        );
      }
      await Promise.all(promises);
      setIsLoaded(true);
    };

    preloadImages();
  }, [totalFrames, basePath]);

  return { isLoaded, progress };
}
