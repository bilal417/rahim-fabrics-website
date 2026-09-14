import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartChannel, CartItem, Product } from '../types';

const STORAGE_KEY = 'rf_cart_v1';

type CartContextValue = {
  channel: CartChannel;
  items: CartItem[];
  count: number;
  subtotal: number;
  setChannel: (channel: CartChannel) => void;
  addProduct: (product: Product, channel: CartChannel, qty?: number) => string | null;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function productImage(product: Product): string | undefined {
  const first = product.images?.[0];
  return typeof first === 'string' ? first : first?.url;
}

function loadCart(): { channel: CartChannel; items: CartItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { channel: 'retail', items: [] };
    const parsed = JSON.parse(raw) as { channel?: CartChannel; items?: CartItem[] };
    return {
      channel: parsed.channel === 'wholesale' ? 'wholesale' : 'retail',
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { channel: 'retail', items: [] };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const initial = loadCart();
  const [channel, setChannelState] = useState<CartChannel>(initial.channel);
  const [items, setItems] = useState<CartItem[]>(initial.items);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ channel, items }));
  }, [channel, items]);

  const setChannel = (next: CartChannel) => {
    setChannelState(next);
    setItems((current) => current.filter((item) => item.channel === next));
  };

  const addProduct = (product: Product, nextChannel: CartChannel, qty?: number) => {
    if (!product._id) return 'Product is missing an id.';
    const unitPrice =
      nextChannel === 'retail' ? Number(product.retailPrice || 0) : Number(product.wholesalePrice || 0);
    if (unitPrice <= 0) return 'Price is not available for this product yet.';

    const unit = nextChannel === 'retail' ? product.retailUnit || 'meter' : 'thaan';
    const minQty =
      nextChannel === 'retail'
        ? Math.max(1, product.minRetailQty || 1)
        : Math.max(1, product.minWholesaleQty || 1);
    const amount = qty ?? minQty;
    if (amount < minQty) return `Minimum quantity is ${minQty} ${unit}.`;

    if (channel !== nextChannel && items.length) {
      return 'Cart already has items from another pricing channel. Clear the cart or switch channel first.';
    }

    setChannelState(nextChannel);
    setItems((current) => {
      const existing = current.find((item) => item.productId === product._id && item.channel === nextChannel);
      if (existing) {
        return current.map((item) =>
          item.productId === product._id
            ? { ...item, qty: item.qty + amount, unitPrice }
            : item,
        );
      }
      return [
        ...current.filter((item) => item.channel === nextChannel),
        {
          productId: product._id!,
          slug: product.slug || product._id!,
          name: product.name,
          code: product.code,
          image: productImage(product),
          channel: nextChannel,
          unit,
          qty: amount,
          unitPrice,
        },
      ];
    });
    return null;
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, qty } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      channel,
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
      setChannel,
      addProduct,
      updateQty,
      removeItem,
      clear,
    }),
    [channel, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
