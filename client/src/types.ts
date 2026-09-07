export interface Product {
  _id?: string; slug?: string; name: string; code: string; category: string; fabricType: string;
  colors: string[]; thaanLength: string; suitsPerThaan: number; stock: number; images: Array<string | { url: string; publicId?: string }>;
  description: string; featured?: boolean; tilePosition?: string;
}

export interface Inquiry { customerName: string; businessName?: string; phone: string; city: string; shopType?: string; monthlyRequirement?: string; productsInterested?: string[]; message?: string; }
