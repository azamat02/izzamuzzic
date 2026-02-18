import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineTrash, HiPlus, HiMinus } from 'react-icons/hi';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../lib/cart';

export function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl tracking-wider text-white mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            КОРЗИНА
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#a0a0a0] text-lg mb-6">Корзина пуста</p>
              <Link
                to="/merch"
                className="inline-block bg-[var(--color-accent)] text-white px-8 py-3 rounded-lg hover:bg-[var(--color-accent-light)] transition-colors font-medium tracking-wider"
              >
                Перейти в магазин
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={`${item.merchItemId}-${item.variantId}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4 flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-[#1a1a1a] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      {item.variantLabel && (
                        <p className="text-[#a0a0a0] text-sm">Размер: {item.variantLabel}</p>
                      )}
                      <p className="text-[var(--color-accent)] font-medium mt-1">
                        {item.price.toLocaleString()} KZT
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.merchItemId, item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#333] text-white hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiMinus className="text-sm" />
                      </button>
                      <span className="text-white w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.merchItemId, item.variantId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#333] text-white hover:border-white transition-colors"
                      >
                        <HiPlus className="text-sm" />
                      </button>
                    </div>

                    <p className="text-white font-medium w-28 text-right">
                      {(item.price * item.quantity).toLocaleString()} KZT
                    </p>

                    <button
                      onClick={() => removeItem(item.merchItemId, item.variantId)}
                      className="text-[#a0a0a0] hover:text-[var(--color-accent)] transition-colors p-2"
                    >
                      <HiOutlineTrash className="text-lg" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-[#141414] border border-[#1a1a1a] rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[#a0a0a0] text-lg">Итого:</span>
                  <span className="text-white text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    {totalAmount.toLocaleString()} KZT
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-[var(--color-accent)] text-white text-center px-8 py-3 rounded-lg hover:bg-[var(--color-accent-light)] transition-colors font-medium tracking-wider"
                >
                  Оформить заказ
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
