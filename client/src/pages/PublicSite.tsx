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
import { useNavigationVisibility } from '../hooks/useNavigationVisibility';

export function PublicSite() {
  const { isSectionVisible } = useNavigationVisibility();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <main>
        <Hero />
        {isSectionVisible('#music') && <Music />}
        {isSectionVisible('#about') && <About />}
        {isSectionVisible('#tour') && <Tour />}
        {isSectionVisible('#gallery') && <Gallery />}
        {isSectionVisible('#merch') && <Merch />}
        {isSectionVisible('#press') && <Press />}
        {isSectionVisible('#contact') && <Contact />}
      </main>
      <Footer />
    </motion.div>
  );
}
