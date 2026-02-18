import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Lightbox } from '../components/ui/Lightbox';
import { usePublicData } from '../hooks/useApi';
import { getThumbnailUrl } from '../lib/image';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  sortOrder: number;
}

export function GalleryPage() {
  const { data: images } = usePublicData<GalleryImage[]>('gallery', '/gallery');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = images || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="GALLERY" subtitle="Behind the scenes and live moments" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
                className="group relative aspect-[3/2] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={getThumbnailUrl(image.src)}
                  alt={image.alt}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== image.src) {
                      img.src = image.src;
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm">{image.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </motion.div>
  );
}
