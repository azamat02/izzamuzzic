import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { usePublicData } from '../../hooks/useApi';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  sortOrder: number;
}

export function Gallery() {
  const { data: images } = usePublicData<GalleryImage[]>('gallery', '/gallery');
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');

  return (
    <section id="gallery" className="py-24 bg-[#141414] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="GALLERY"
          subtitle={settings?.gallerySubtitle || 'Behind the scenes and live moments'}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(images || []).map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[3/2] overflow-hidden rounded-lg cursor-pointer"
            >
              <img
                src={image.src}
                alt={image.alt}
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
    </section>
  );
}
