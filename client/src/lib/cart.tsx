import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  merchItemId: number;
  variantId: number | null;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (merchItemId: number, variantId: number | null) => void;
  updateQuantity: (merchItemId: number, variantId: number | null, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0,
  itemCount: 0,
});

export function useCart() {
  return useContext(CartContext);
}

const STORAGE_KEY = 'izzamuzzic_cart';

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.merchItemId === item.merchItemId && i.variantId === item.variantId
      );
      if (existing) {
        return prev.map(i =>
          i.merchItemId === item.merchItemId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((merchItemId: number, variantId: number | null) => {
    setItems(prev => prev.filter(
      i => !(i.merchItemId === merchItemId && i.variantId === variantId)
    ));
  }, []);

  const updateQuantity = useCallback((merchItemId: number, variantId: number | null, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i =>
      i.merchItemId === merchItemId && i.variantId === variantId
        ? { ...i, quantity }
        : i
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}
