import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SectionTitle } from '../components/ui/SectionTitle';
import { Lightbox } from '../components/ui/Lightbox';
import { getThumbnailUrl } from '../lib/image';
import { api } from '../lib/api';

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  sortOrder: number;
}

interface GalleryResponse {
  items: GalleryImage[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 50;

export function GalleryPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<GalleryResponse>({
    queryKey: ['gallery-page'],
    queryFn: ({ pageParam }) =>
      api.get<GalleryResponse>(`/gallery?page=${pageParam}&limit=${PAGE_SIZE}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });

  const allImages = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

          {hasNextPage && (
            <div className="text-center mt-12">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-block border border-white/30 text-white text-sm uppercase tracking-wider px-8 py-3 rounded-lg hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
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
