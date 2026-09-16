export type RetailUnit = 'meter' | 'suit';
export type CartChannel = 'retail' | 'wholesale';
export type PaymentMethod = 'cod' | 'bank_transfer';

export interface Product {
  _id?: string;
  slug?: string;
  name: string;
  code: string;
  category: string;
  fabricType: string;
  colors: string[];
  thaanLength: string;
  suitsPerThaan: number;
  stock: number;
  stockMeters?: number;
  retailPrice?: number;
  compareAtPrice?: number;
  bundleQty?: number;
  bundlePrice?: number;
  wholesalePrice?: number;
  retailUnit?: RetailUnit;
  minRetailQty?: number;
  minWholesaleQty?: number;
  images: Array<string | { url: string; publicId?: string }>;
  description: string;
  featured?: boolean;
  retailOnly?: boolean;
  purchaseMode?: 'checkout' | 'whatsapp';
  unlimitedStock?: boolean;
  tilePosition?: string;
}

export interface Inquiry {
  customerName: string;
  businessName?: string;
  phone: string;
  city: string;
  shopType?: string;
  monthlyRequirement?: string;
  productsInterested?: string[];
  message?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  code: string;
  image?: string;
  channel: CartChannel;
  unit: 'meter' | 'suit' | 'thaan';
  qty: number;
  unitPrice: number;
  bundleQty?: number;
  bundlePrice?: number;
}

export function calculateItemTotal(item: Pick<CartItem, 'qty' | 'unitPrice' | 'bundleQty' | 'bundlePrice'>): number {
  const bundleQty = Math.floor(Number(item.bundleQty || 0));
  const bundlePrice = Number(item.bundlePrice || 0);
  if (bundleQty > 1 && bundlePrice > 0 && Number.isInteger(item.qty)) {
    const bundles = Math.floor(item.qty / bundleQty);
    const singles = item.qty % bundleQty;
    return bundles * bundlePrice + singles * item.unitPrice;
  }
  return item.qty * item.unitPrice;
}

export interface OrderItem {
  _id?: string;
  productId?: string | null;
  productName: string;
  productCode: string;
  unit: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  channel: CartChannel;
  customerName: string;
  businessName?: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  createdAt?: string;
  bankDetails?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
  } | null;
}

export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}
