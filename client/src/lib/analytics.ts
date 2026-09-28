import type { CartItem, Order, Product } from '../types';
import { calculateItemTotal } from '../types';

export const GA_MEASUREMENT_ID = 'G-04WKCJ4P8W';

type GtagCommand = 'config' | 'event' | 'js' | 'set';
type Gtag = (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function sendEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackPageView(path: string) {
  sendEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
}

export function productAnalyticsItem(product: Product, quantity = 1, channel = 'retail') {
  const price = channel === 'wholesale' ? product.wholesalePrice : product.retailPrice;
  return {
    item_id: product.code,
    item_name: product.name,
    item_brand: product.name.toLowerCase().includes('gul ahmed') ? 'Gul Ahmed' : 'Rahim Fabrics',
    item_category: product.category,
    item_variant: product.colors?.[0] || undefined,
    price: Number(price || 0),
    quantity,
  };
}

export function cartAnalyticsItem(item: CartItem) {
  return {
    item_id: item.code,
    item_name: item.name,
    item_brand: item.name.toLowerCase().includes('gul ahmed') ? 'Gul Ahmed' : 'Rahim Fabrics',
    item_category: item.channel,
    price: Number(item.unitPrice || 0),
    quantity: item.qty,
  };
}

export function trackViewItem(product: Product) {
  sendEvent('view_item', {
    currency: 'PKR',
    value: Number(product.retailPrice || 0),
    items: [productAnalyticsItem(product)],
  });
}

export function trackAddToCart(product: Product, channel: 'retail' | 'wholesale', quantity: number) {
  const price = channel === 'wholesale' ? product.wholesalePrice : product.retailPrice;
  sendEvent('add_to_cart', {
    currency: 'PKR',
    value: Number(price || 0) * quantity,
    items: [productAnalyticsItem(product, quantity, channel)],
  });
}

export function trackViewCart(items: CartItem[]) {
  sendEvent('view_cart', {
    currency: 'PKR',
    value: items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    items: items.map(cartAnalyticsItem),
  });
}

export function trackBeginCheckout(items: CartItem[]) {
  sendEvent('begin_checkout', {
    currency: 'PKR',
    value: items.reduce((sum, item) => sum + calculateItemTotal(item), 0),
    items: items.map(cartAnalyticsItem),
  });
}

export function trackPurchase(order: Order) {
  const storageKey = `rf_ga_purchase_${order.orderNumber}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
  } catch {
    // Analytics should still work when storage is unavailable.
  }

  sendEvent('purchase', {
    transaction_id: order.orderNumber,
    value: Number(order.total || order.subtotal || 0),
    currency: 'PKR',
    shipping: Math.max(0, Number(order.total || 0) - Number(order.subtotal || 0)),
    payment_type: order.paymentMethod,
    items: order.items.map((item) => ({
      item_id: item.productCode,
      item_name: item.productName,
      item_category: order.channel,
      price: Number(item.unitPrice || 0),
      quantity: item.qty,
    })),
  });

  try {
    sessionStorage.setItem(storageKey, '1');
  } catch {
    // No-op when storage is unavailable.
  }
}

export function trackLead(source: string, details: Record<string, unknown> = {}) {
  sendEvent('generate_lead', {
    lead_source: source,
    ...details,
  });
}
