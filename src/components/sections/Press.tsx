import { motion } from 'framer-motion';
import { SectionTitle } from '../ui/SectionTitle';
import { Button } from '../ui/Button';
import { pressItems } from '../../data/press';
import { FaQuoteLeft } from 'react-icons/fa';

export function Press() {
  return (
    <section id="press" className="py-24 bg-[#141414] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionTitle
          title="PRESS"
          subtitle="What they're saying"
        />

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {pressItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#0a0a0a] p-8 rounded-lg relative"
            >
              <FaQuoteLeft className="text-[#e63946] text-3xl mb-4 opacity-50" />
              <p className="text-[#a0a0a0] text-lg italic mb-6 leading-relaxed">
                {item.quote}
              </p>
              <p className="text-white font-medium">— {item.source}</p>
            </motion.div>
          ))}
        </div>

        {/* Press Kit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[#a0a0a0] mb-4">
            Looking for press materials, high-res photos, or interview requests?
          </p>
          <Button href="#contact" variant="outline" size="md">
            Download Press Kit
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
