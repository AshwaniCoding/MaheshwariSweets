export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerUnit: number; // e.g. Price for 250g, 500g or 1kg
  unit: string; // e.g. "250g", "500g", "1kg", "pc"
  price: number; // standard base price
  image: string;
  ingredients: string[];
  shelfLife: string;
  isVeg: boolean;
  isBestSeller?: boolean;
  isFreshlyMadeToday?: boolean;
  rating: number;
  reviewsCount: number;
  nutrition?: {
    calories: string;
    protein: string;
    carbohydrates: string;
    fat: string;
  };
}

export interface Order {
  id: string;
  items: {
    product: Product;
    quantity: number;
    selectedUnit: string;
    price: number;
  }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: "delivery" | "pickup";
  address?: {
    street: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid";
  orderStatus: "received" | "preparing" | "out_for_delivery" | "completed";
  couponCode?: string;
  discount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

export interface CateringInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guestsCount: number;
  occasion: string;
  packageType: "silver" | "gold" | "royal_diamond";
  selectedSweets: string[];
  selectedNamkeens: string[];
  additionalRequirements?: string;
  estimatedPrice: number;
  status: "pending" | "contacted" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productName?: string;
  approved: boolean;
  createdAt: string;
}

export interface FAQResponse {
  answer: string;
}
