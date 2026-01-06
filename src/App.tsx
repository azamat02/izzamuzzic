import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Music } from './components/sections/Music';
import { About } from './components/sections/About';
import { Tour } from './components/sections/Tour';
import { Gallery } from './components/sections/Gallery';
import { Merch } from './components/sections/Merch';
import { Press } from './components/sections/Press';
import { Contact } from './components/sections/Contact';
import { Preloader } from './components/ui/Preloader';
import { usePreloadFrames } from './hooks/usePreloadFrames';

const TOTAL_FRAMES = 121;

function App() {
  const { isLoaded, progress } = usePreloadFrames(TOTAL_FRAMES, '/frames');

  return (
    <>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="preloader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Preloader progress={progress} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <main>
          <Hero />
          <Music />
          <About />
          <Tour />
          <Gallery />
          <Merch />
          <Press />
          <Contact />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}

export default App;
