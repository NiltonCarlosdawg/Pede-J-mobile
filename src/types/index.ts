export type Role = 'cliente' | 'entregador' | 'restaurante' | 'admin';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export type RestaurantStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export type SubscriptionStatus = 'active' | 'expired' | 'revoked';

export type PaymentMethodType = 'paypay' | 'multicaixa_express' | 'unitel_money' | 'facipay';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  status?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface OpeningHour {
  id?: string;
  restaurantId?: string;
  diaSemana: number;
  abre: string;
  fecha: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  ratingCount: number;
  distance: number | null;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  logo?: string;
  isOpen: boolean;
  description?: string;
  ownerId?: string;
  status?: RestaurantStatus;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlanId?: string;
  plan?: string;
  productsCount?: number;
  openingHours?: OpeningHour[];
}

export interface RestaurantPage {
  data: Restaurant[];
  next_cursor: string | null;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number | string;
  image: string;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  hidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPage {
  data: Product[];
  next_cursor: string | null;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderTimelineEntry {
  status: string;
  timestamp: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  restaurant: Restaurant;
  address: Address;
  entregadorId?: string;
  cupomAplicado?: string;
  paymentId?: string;
  timeline?: OrderTimelineEntry[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPage {
  data: Order[];
  next_cursor: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  isDefault: boolean;
}

export interface MulticaixaExpressReference {
  entity: string;
  entityName: string;
  reference: string;
  amount: number;
  phoneNumber: string;
  expiryDate: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  methodType: PaymentMethodType;
  amount: number;
  status: PaymentStatus;
  reference?: MulticaixaExpressReference;
  timestamp: string;
  completedAt?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  timestamp: string;
}

export interface ChatMessage {
  senderId: string;
  senderRole: Role;
  texto: string;
  timestamp: string;
  tipo: 'texto' | 'imagem' | 'sistema';
}

export interface Rating {
  id: string;
  orderId: string;
  createdAt: string;
  estrelas: number;
  comentario?: string;
  tags?: string[];
}

export interface AddressPage {
  data: Address[];
  next_cursor: string | null;
}

export interface Earnings {
  periodo: string;
  totalGanho: number;
  totalEntregas: number;
  mediaPorEntrega: number;
  detalhe: Array<{
    data: string;
    ganho: number;
    entregas: number;
  }>;
}