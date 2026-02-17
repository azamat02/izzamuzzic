import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { usePublicData } from '../hooks/useApi';
import { useCart } from '../lib/cart';
import { useToast } from '../components/admin/Toast';

interface MerchImage {
  id: number;
  merchItemId: number;
  url: string;
  sortOrder: number;
}

interface MerchVariant {
  id: number;
  merchItemId: number;
  label: string;
  inStock: boolean;
  sortOrder: number;
}

interface MerchItem {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  url: string | null;
  sortOrder: number;
  images: MerchImage[];
  variants: MerchVariant[];
}

export function MerchItemPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = usePublicData<MerchItem>(
    `merch-${id}`,
    `/merch/${id}`
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  const allImages = item
    ? [item.image, ...(item.images || []).map(img => img.url)].filter(Boolean)
    : [];
  const activeImage = selectedImage || allImages[0] || '';

  const variants = item?.variants || [];
  const hasVariants = variants.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/merch"
            className="inline-flex items-center text-[#a0a0a0] hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Merch
          </Link>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {item && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12"
            >
              <div>
                {/* Main image */}
                <div className="aspect-square overflow-hidden rounded-lg bg-[#141414] mb-4">
                  <img
                    src={activeImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {allImages.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(src)}
                        className={`aspect-square overflow-hidden rounded-lg bg-[#141414] border-2 transition-colors ${
                          activeImage === src ? 'border-[#e63946]' : 'border-transparent hover:border-[#a0a0a0]'
                        }`}
                      >
                        <img
                          src={src}
                          alt={`${item.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <h1
                  className="text-4xl md:text-5xl tracking-wider text-white mb-4"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.name}
                </h1>
                <p className="text-[#e63946] text-2xl font-medium">
                  ${item.price} {item.currency}
                </p>

                {item.description && (
                  <p className="text-[#a0a0a0] mt-6 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {hasVariants && (
                  <div className="mt-6">
                    <p className="text-[#a0a0a0] text-sm mb-3">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          disabled={!variant.inStock}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`px-4 py-2 rounded-lg text-sm border transition-colors relative ${
                            !variant.inStock
                              ? 'border-[#333] text-[#555] cursor-not-allowed line-through'
                              : selectedVariant === variant.id
                                ? 'border-[#e63946] text-white bg-[#e63946]/10'
                                : 'border-[#555] text-white hover:border-white'
                          }`}
                        >
                          {variant.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={() => {
                      if (!item) return;
                      const variant = variants.find(v => v.id === selectedVariant);
                      addItem({
                        merchItemId: item.id,
                        variantId: variant?.id || null,
                        name: item.name,
                        variantLabel: variant?.label || '',
                        price: item.price,
                        image: item.image,
                      });
                      toast('Товар добавлен в корзину', 'success');
                    }}
                    disabled={hasVariants && !selectedVariant}
                    className="bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors text-center font-medium tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Добавить в корзину
                  </button>
                  {hasVariants && !selectedVariant && (
                    <p className="text-[#a0a0a0] text-sm mt-2">Выберите размер</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
