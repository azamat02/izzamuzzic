import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineShoppingCart } from 'react-icons/hi';
import { SocialLinks } from '../ui/SocialLinks';
import { useNavigationVisibility } from '../../hooks/useNavigationVisibility';
import { usePublicData } from '../../hooks/useApi';
import { useCart } from '../../lib/cart';

interface NavigationItem {
  id: number;
  label: string;
  href: string;
  visible: boolean;
  sortOrder: number;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: navItems } = usePublicData<NavigationItem[]>('navigation', '/navigation');
  const { isSectionVisible } = useNavigationVisibility();

  const { itemCount } = useCart();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const visibleItems = (navItems || []).filter(item => item.visible);
  const isMerchVisible = isSectionVisible('#merch');

  const getNavHref = (href: string) => {
    if (isHomePage) return href;
    return `/${href}`;
  };

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
        isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="w-full px-6 sm:px-10 lg:px-16">
        <div className="relative flex items-center justify-between h-20 w-full">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo_white.png" alt="IZZAMUZZIC" className="h-16" />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {visibleItems.map((item) => (
              <a
                key={item.id}
                href={getNavHref(item.href)}
                className="text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-300 uppercase tracking-wider"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <SocialLinks size="sm" />
            {isMerchVisible && (
              <Link to="/cart" className="relative text-white hover:text-[var(--color-accent)] transition-colors">
                <HiOutlineShoppingCart className="text-xl" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white text-2xl p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a0a]/98 backdrop-blur-md w-full"
          >
            <nav className="flex flex-col items-center py-8 gap-6 w-full">
              {visibleItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={getNavHref(item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-white hover:text-[var(--color-accent)] transition-colors uppercase tracking-wider"
                >
                  {item.label}
                </motion.a>
              ))}
              {isMerchVisible && (
                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-lg font-medium text-white hover:text-[var(--color-accent)] transition-colors uppercase tracking-wider flex items-center gap-2"
                >
                  <HiOutlineShoppingCart className="text-xl" />
                  Cart
                  {itemCount > 0 && (
                    <span className="bg-[var(--color-accent)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
              <SocialLinks size="md" className="mt-4" />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
