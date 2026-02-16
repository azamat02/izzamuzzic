import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { SocialLinks } from '../ui/SocialLinks';

const navItems = [
  { label: 'Music', href: '#music' },
  { label: 'About', href: '#about' },
  
  { label: 'Gallery', href: '#gallery' },
  { label: 'Merch', href: '#merch' },
  
  { label: 'Contact', href: '#contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20 w-full">
          {/* Logo */}
          <a href="#" className="hover:opacity-80 transition-opacity">
            <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-16" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#a0a0a0] hover:text-white transition-colors duration-300 uppercase tracking-wider"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Social Links */}
          <div className="hidden lg:block">
            <SocialLinks size="sm" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white text-2xl p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0a]/98 backdrop-blur-md w-full"
          >
            <nav className="flex flex-col items-center py-8 gap-6 w-full">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-[#a0a0a0] hover:text-white transition-colors uppercase tracking-wider"
                >
                  {item.label}
                </motion.a>
              ))}
              <SocialLinks size="md" className="mt-4" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
