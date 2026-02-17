import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineUpload, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../lib/cart';
import { usePublicData } from '../hooks/useApi';

export function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { data: settings } = usePublicData<Record<string, string>>('settings', '/settings');
  const kaspiPayUrl = settings?.kaspiPayUrl || '';

  const [step, setStep] = useState(1);

  // Step 1 — customer data
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Step 3 — receipt
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptValid, setReceiptValid] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState('');

  // Step 4 — result
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if cart is empty and not on final step
  if (items.length === 0 && step < 4) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Header />
        <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
          <div className="max-w-2xl mx-auto px-4 text-center py-20">
            <p className="text-[#a0a0a0] text-lg mb-6">Корзина пуста</p>
            <Link to="/merch" className="inline-block bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium">
              Перейти в магазин
            </Link>
          </div>
        </main>
        <Footer />
      </motion.div>
    );
  }

  const step1Valid = customerName.trim() && customerPhone.trim() && customerEmail.trim() && customerAddress.trim();

  const handleReceiptUpload = async (file: File) => {
    setUploading(true);
    setReceiptPreview(URL.createObjectURL(file));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/receipt', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setReceiptUrl(data.url);
      setReceiptValid(data.valid);
    } catch {
      setReceiptValid(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleReceiptUpload(file);
  }, []);

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
          items: items.map(i => ({
            merchItemId: i.merchItemId,
            variantId: i.variantId,
            name: i.name,
            variantLabel: i.variantLabel,
            price: i.price,
            quantity: i.quantity,
          })),
          receiptUrl,
          receiptValid,
        }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      setOrderId(data.id);
      setOrderStatus(data.status);
      clearCart();
      setStep(4);
    } catch {
      alert('Ошибка при создании заказа. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Header />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl tracking-wider text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
            ОФОРМЛЕНИЕ ЗАКАЗА
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-10">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step ? 'bg-[#e63946] text-white' : 'bg-[#1a1a1a] text-[#555]'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-[#e63946]' : 'bg-[#1a1a1a]'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Customer data */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <h2 className="text-xl text-white font-medium mb-4">Данные покупателя</h2>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-1">ФИО</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:border-[#e63946] focus:outline-none"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-1">Телефон</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:border-[#e63946] focus:outline-none"
                  placeholder="+7 (777) 123-45-67"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:border-[#e63946] focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-[#a0a0a0] text-sm mb-1">Адрес доставки</label>
                <textarea
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-[#141414] border border-[#1a1a1a] rounded-lg px-4 py-3 text-white focus:border-[#e63946] focus:outline-none resize-none"
                  placeholder="Город, улица, дом, квартира"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="w-full bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее
              </button>
            </motion.div>
          )}

          {/* Step 2: Kaspi payment */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl text-white font-medium mb-4">Оплата через Kaspi</h2>

              <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-5 space-y-3">
                <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider">Сводка заказа</h3>
                {items.map(item => (
                  <div key={`${item.merchItemId}-${item.variantId}`} className="flex justify-between text-sm">
                    <span className="text-white">
                      {item.name} {item.variantLabel ? `(${item.variantLabel})` : ''} x{item.quantity}
                    </span>
                    <span className="text-[#a0a0a0]">{(item.price * item.quantity).toLocaleString()} KZT</span>
                  </div>
                ))}
                <div className="border-t border-[#1a1a1a] pt-3 flex justify-between">
                  <span className="text-white font-medium">Итого:</span>
                  <span className="text-[#e63946] font-bold text-lg">{totalAmount.toLocaleString()} KZT</span>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5 text-center space-y-4">
                <p className="text-[#a0a0a0]">
                  Оплатите точную сумму <span className="text-white font-bold">{totalAmount.toLocaleString()} KZT</span> и сохраните чек
                </p>
                {kaspiPayUrl ? (
                  <a
                    href={kaspiPayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#f14635] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium"
                  >
                    Оплатить через Kaspi
                  </a>
                ) : (
                  <p className="text-yellow-400 text-sm">Ссылка на оплату не настроена. Свяжитесь с администратором.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#333] text-white px-8 py-3 rounded-lg hover:border-white transition-colors font-medium">
                  Назад
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium">
                  Далее — загрузить чек
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Receipt upload */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <h2 className="text-xl text-white font-medium mb-4">Загрузка чека</h2>

              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#333] rounded-lg p-10 text-center hover:border-[#e63946] transition-colors"
              >
                {receiptPreview ? (
                  <div className="space-y-4">
                    <img src={receiptPreview} alt="Чек" className="max-h-64 mx-auto rounded-lg" />
                    {uploading && <p className="text-[#a0a0a0]">Загрузка...</p>}
                    {!uploading && receiptValid === true && (
                      <div className="flex items-center justify-center gap-2 text-green-400">
                        <HiCheckCircle className="text-xl" />
                        <span>Чек подтверждён</span>
                      </div>
                    )}
                    {!uploading && receiptValid === false && (
                      <div className="flex items-center justify-center gap-2 text-red-400">
                        <HiXCircle className="text-xl" />
                        <span>Чек отклонён</span>
                      </div>
                    )}
                    {!uploading && receiptValid === null && receiptUrl && (
                      <div className="flex items-center justify-center gap-2 text-yellow-400">
                        <HiClock className="text-xl" />
                        <span>Обрабатывается — будет проверен вручную</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <HiOutlineUpload className="text-4xl text-[#a0a0a0] mx-auto" />
                    <p className="text-[#a0a0a0]">Перетащите скриншот чека сюда или</p>
                    <label className="inline-block bg-[#1a1a1a] text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-[#333] transition-colors">
                      Выберите файл
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleReceiptUpload(file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {receiptPreview && !uploading && (
                <label className="block text-center">
                  <span className="text-[#a0a0a0] text-sm cursor-pointer hover:text-white transition-colors">
                    Загрузить другой файл
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleReceiptUpload(file);
                    }}
                  />
                </label>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#333] text-white px-8 py-3 rounded-lg hover:border-white transition-colors font-medium">
                  Назад
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!receiptUrl || uploading || receiptValid === false || submitting}
                  className="flex-1 bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Отправка...' : 'Отправить заказ'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-6">
              {orderStatus === 'paid' ? (
                <>
                  <HiCheckCircle className="text-6xl text-green-400 mx-auto" />
                  <h2 className="text-2xl text-white font-medium">Заказ #{orderId} принят!</h2>
                  <p className="text-[#a0a0a0]">Оплата подтверждена. Мы свяжемся с вами по указанным контактам.</p>
                </>
              ) : (
                <>
                  <HiClock className="text-6xl text-yellow-400 mx-auto" />
                  <h2 className="text-2xl text-white font-medium">Заказ #{orderId} — ожидает проверки оплаты</h2>
                  <p className="text-[#a0a0a0]">Ваш чек будет проверен в ближайшее время. Мы свяжемся с вами после подтверждения.</p>
                </>
              )}
              <div className="flex gap-3 justify-center">
                <Link
                  to="/merch"
                  className="inline-block bg-[#e63946] text-white px-8 py-3 rounded-lg hover:bg-[#ff6b6b] transition-colors font-medium"
                >
                  Вернуться в магазин
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
