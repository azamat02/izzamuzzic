import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../components/admin/Toast';
import { HiX } from 'react-icons/hi';

interface OrderItem {
  id: number;
  orderId: number;
  merchItemId: number;
  variantId: number | null;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  currency: string;
  status: string;
  receiptUrl: string;
  note: string;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  paid: 'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  shipped: 'bg-purple-500/20 text-purple-400',
};

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  paid: 'Оплачен',
  confirmed: 'Подтверждён',
  rejected: 'Отклонён',
  shipped: 'Отправлен',
};

export function OrdersEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders'),
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, string> }) =>
      api.put(`/orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast('Заказ обновлён', 'success');
    },
    onError: () => toast('Ошибка обновления', 'error'),
  });

  const handleStatusChange = (id: number, status: string) => {
    updateMutation.mutate({ id, data: { status } });
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleSaveNote = (id: number) => {
    updateMutation.mutate({ id, data: { note: noteValue } });
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setNoteValue(order.note || '');
  };

  return (
    <div>
      <h1 className="text-3xl text-white mb-8" style={{ fontFamily: 'var(--font-heading)' }}>ORDERS</h1>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {orders && orders.length === 0 && (
        <p className="text-[#a0a0a0] text-center py-10">Заказов пока нет</p>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => openOrder(order)}
              className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-4 cursor-pointer hover:border-[#e63946]/30 transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">#{order.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <span className="text-[#a0a0a0] text-sm">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[#a0a0a0] text-sm">{order.customerName}</span>
                <span className="text-white font-medium">{order.totalAmount.toLocaleString()} {order.currency}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-[#141414] border border-[#1a1a1a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <h2 className="text-xl text-white font-medium">Заказ #{selectedOrder.id}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[selectedOrder.status] || ''}`}>
                  {statusLabels[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#a0a0a0] hover:text-white">
                <HiX className="text-xl" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Customer info */}
              <div>
                <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Покупатель</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-[#a0a0a0]">ФИО:</span> <span className="text-white">{selectedOrder.customerName}</span></div>
                  <div><span className="text-[#a0a0a0]">Телефон:</span> <span className="text-white">{selectedOrder.customerPhone}</span></div>
                  <div><span className="text-[#a0a0a0]">Email:</span> <span className="text-white">{selectedOrder.customerEmail}</span></div>
                  <div className="sm:col-span-2"><span className="text-[#a0a0a0]">Адрес:</span> <span className="text-white">{selectedOrder.customerAddress}</span></div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Товары</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm bg-[#0a0a0a] rounded-lg px-3 py-2">
                      <span className="text-white">
                        {item.name} {item.variantLabel ? `(${item.variantLabel})` : ''} x{item.quantity}
                      </span>
                      <span className="text-[#a0a0a0]">{(item.price * item.quantity).toLocaleString()} KZT</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t border-[#1a1a1a]">
                    <span className="text-white font-medium">Итого:</span>
                    <span className="text-[#e63946] font-bold">{selectedOrder.totalAmount.toLocaleString()} {selectedOrder.currency}</span>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              {selectedOrder.receiptUrl && (
                <div>
                  <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Чек</h3>
                  <img
                    src={selectedOrder.receiptUrl}
                    alt="Чек"
                    className="max-h-48 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setReceiptModalUrl(selectedOrder.receiptUrl)}
                  />
                </div>
              )}

              {/* Note */}
              <div>
                <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Заметка</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteValue}
                    onChange={e => setNoteValue(e.target.value)}
                    className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 text-white text-sm focus:border-[#e63946] focus:outline-none"
                    placeholder="Добавить заметку..."
                  />
                  <button
                    onClick={() => handleSaveNote(selectedOrder.id)}
                    className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#333] transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </div>

              {/* Status actions */}
              <div>
                <h3 className="text-[#a0a0a0] text-sm uppercase tracking-wider mb-2">Действия</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                    className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                  >
                    Подтвердить
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'rejected')}
                    className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                  >
                    Отклонить
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                    className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                  >
                    Отправлен
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt fullscreen modal */}
      {receiptModalUrl && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setReceiptModalUrl(null)}>
          <img src={receiptModalUrl} alt="Чек" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
