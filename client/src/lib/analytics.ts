import type { CartItem, Order, Product } from '../types';
import { calculateItemTotal } from '../types';

export const GA_MEASUREMENT_ID = 'G-04WKCJ4P8W';

type GtagCommand = 'config' | 'event' | 'js' | 'set';
type Gtag = (command: GtagCommand, target: string | Date, params?: Record<string, unknown>) => void;
type Fbq = (command: 'track' | 'trackCustom', event: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    fbq?: Fbq;
  }
}

function sendEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

function sendPixelEvent(name: string, params: Record<string, unknown> = {}, eventID?: string) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq('track', name, params, eventID ? { eventID } : undefined);
}

export function trackPageView(path: string) {
  sendEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
  sendPixelEvent('PageView');
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
  sendPixelEvent('ViewContent', {
    content_ids: [product.code],
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: Number(product.retailPrice || 0),
    currency: 'PKR',
  });
}

export function trackAddToCart(
  product: Product,
  channel: 'retail' | 'wholesale',
  quantity: number,
  selectedPrice?: number,
  selectedUnit?: string,
) {
  const price = selectedPrice ?? (channel === 'wholesale' ? product.wholesalePrice : product.retailPrice);
  sendEvent('add_to_cart', {
    currency: 'PKR',
    value: Number(price || 0) * quantity,
    items: [{ ...productAnalyticsItem(product, quantity, channel), price: Number(price || 0), item_variant: selectedUnit }],
  });
  sendPixelEvent('AddToCart', {
    content_ids: [product.code],
    content_name: product.name,
    content_type: 'product',
    contents: [{ id: product.code, quantity }],
    value: Number(price || 0) * quantity,
    currency: 'PKR',
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
  const value = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  sendEvent('begin_checkout', {
    currency: 'PKR',
    value,
    items: items.map(cartAnalyticsItem),
  });
  sendPixelEvent('InitiateCheckout', {
    content_ids: items.map((item) => item.code),
    contents: items.map((item) => ({ id: item.code, quantity: item.qty })),
    content_type: 'product',
    num_items: items.reduce((sum, item) => sum + item.qty, 0),
    value,
    currency: 'PKR',
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
  sendPixelEvent('Purchase', {
    content_ids: order.items.map((item) => item.productCode),
    contents: order.items.map((item) => ({ id: item.productCode, quantity: item.qty })),
    content_type: 'product',
    num_items: order.items.reduce((sum, item) => sum + item.qty, 0),
    value: Number(order.total || order.subtotal || 0),
    currency: 'PKR',
  }, order.orderNumber);

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
  // WhatsApp clicks are contact intent; the wholesale form is a submitted lead.
  sendPixelEvent(source.includes('whatsapp') ? 'Contact' : 'Lead', { content_name: source });
}
