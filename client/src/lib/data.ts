import type { Product } from '../types';

export const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '923219454085';
export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

/** Display address used in header, footer, and page copy */
export const ADDRESS_SHORT = 'G Ground Floor, New Azam Cloth Market, Lahore';

/** Full legal / maps address */
export const ADDRESS_FULL =
  'Rahim Fabrics by Safeer Naseer Fabrics, G Ground Floor, New Azam Cloth Market, 41/A, Mohalla Buzurg Shah Nawan Mohalla, Walled City of Lahore, Lahore 54000, Pakistan';

export const BRAND_LINE = 'Rahim Fabrics by Safeer Naseer Fabrics';

export const SOCIAL = {
  facebook: 'https://www.facebook.com/profile.php?id=61594455503016',
  /** Paste Instagram profile URL here when ready */
  instagram: '' as string,
};

export const PHONE_DISPLAY = '+92 321 9454085';
export const PHONE_TEL = '+923219454085';
export const EMAIL = 'info@rahimfabrics.site';

/** Seed catalogue — empty until admin adds live products */
export const products: Product[] = [];

export const categories = ['All Fabrics', 'Wash & Wear', 'Cotton', 'Khaddar', 'Summer', 'Winter'];
