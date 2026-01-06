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

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
