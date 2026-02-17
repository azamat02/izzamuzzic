import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { Music } from '../components/sections/Music';
import { About } from '../components/sections/About';
import { Gallery } from '../components/sections/Gallery';
import { Merch } from '../components/sections/Merch';
import { Contact } from '../components/sections/Contact';
import { Tour } from '../components/sections/Tour';
import { Press } from '../components/sections/Press';
import { usePublicData } from '../hooks/useApi';

interface NavigationItem {
  id: number;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
}

export function PublicSite() {
  const { data: navItems } = usePublicData<NavigationItem[]>('navigation', '/navigation');

  const isSectionVisible = (href: string) => {
    if (!navItems) return false;
    const item = navItems.find(n => n.href === href);
    return item?.visible ?? false;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main>
        <Hero />
        <Music />
        <About />
        {isSectionVisible('#tour') && <Tour />}
        <Gallery />
        <Merch />
        {isSectionVisible('#press') && <Press />}
        <Contact />
      </main>
      <Footer />
    </motion.div>
  );
}
