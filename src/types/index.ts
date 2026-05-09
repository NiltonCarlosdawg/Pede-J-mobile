export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  neighborhood: string;
  city: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  ratingCount: number;
  distance: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  isOpen: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  items: CartItem[];
  restaurant: Restaurant;
  address: Address;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'wallet' | 'cash';
  label: string;
  isDefault: boolean;
  cardNumber?: string; // Last 4 digits
  cardHolder?: string;
  expiryDate?: string;
  brand?: string; // Visa, Mastercard, etc.
  pixKey?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  timestamp: string;
}