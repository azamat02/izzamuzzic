import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SectionTitle } from '../ui/SectionTitle';
import { Button } from '../ui/Button';
import { usePublicData } from '../../hooks/useApi';

interface MerchItem {
  id: number;
  name: string;
  price: number;
  currency: string;
  image: string;
  sortOrder: number;
}

export function Merch() {
  const { data: items } = usePublicData<MerchItem[]>('merch', '/merch');
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');

  return (
    <section id="merch" className="py-24 bg-[#0a0a0a] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="MERCH"
          subtitle={settings?.merchSubtitle || 'Official merchandise'}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(items || []).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link to={`/merch/${item.id}`}>
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
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/merch">
            <Button variant="outline" size="lg">
              View All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
