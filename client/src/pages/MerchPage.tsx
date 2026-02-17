import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SectionTitle } from '../components/ui/SectionTitle';
import { usePublicData } from '../hooks/useApi';

interface MerchItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  image: string;
  sortOrder: number;
}

export function MerchPage() {
  const { data: items } = usePublicData<MerchItem[]>('merch', '/merch');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="MERCH" subtitle="Official merchandise" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(items || []).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/merch/${item.id}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4 bg-[#141414]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-white font-medium mb-1">{item.name}</h3>
                  <p className="text-[#e63946] font-medium mb-3">
                    ${item.price} {item.currency}
                  </p>
                  <span className="inline-block border border-white/30 text-white text-xs uppercase tracking-wider px-4 py-2 rounded-lg group-hover:border-[#e63946] group-hover:text-[#e63946] transition-colors">
                    View Details
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
