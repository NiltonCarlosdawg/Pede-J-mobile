export type Role = 'cliente' | 'entregador' | 'restaurante' | 'admin';

export type OrderStatus =
  'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export type RestaurantStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export type SubscriptionStatus = 'active' | 'expired' | 'revoked';

export type PaymentMethodType = 'paypay' | 'multicaixa_express' | 'unitel_money' | 'facipay';

export type PaymentStatus =
  'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

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
  note?: string | null;
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
  expiryDate: string;
}

export interface MulticaixaExpressPush {
  phoneNumber: string;
  expiresInSeconds: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  methodType: PaymentMethodType;
  amount: number;
  status: PaymentStatus;
  push?: MulticaixaExpressPush;
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
  push?: MulticaixaExpressPush;
  reference?: MulticaixaExpressReference;
  timestamp: string;
  completedAt?: string;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderRole: Role;
  texto: string;
  timestamp?: string;
  createdAt?: string;
  tipo: 'texto' | 'imagem' | 'sistema' | 'text' | 'image' | 'system';
}

export interface ChatReadState {
  orderId: string;
  lastReadAt: string | null;
  unreadCount: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OrderRoute {
  orderId: string;
  status: OrderStatus;
  deliveryState: string | null;
  origem: Coordinates | null;
  destino: Coordinates;
  route: Coordinates[];
  lastKnown: {
    entregadorId: string | null;
    latitude: number | null;
    longitude: number | null;
    heading: number | null;
    timestamp: string;
  };
}

export interface CouponValidationResponse {
  valido: boolean;
  tipo: 'percentual' | 'valor_fixo';
  desconto: number;
  mensagem: string;
  codigo: string;
}

export interface PromotionSummary {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  active?: boolean;
  restaurantId?: string | null;
  discountPercent?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  restaurant?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
}

export interface VoipNativeConfig {
  ios: {
    pushKit: boolean;
    callKit: boolean;
    topic: string | null;
  };
  android: {
    fcmHighPriority: boolean;
    connectionService: boolean;
    channelId: string;
  };
}

export interface VoipConfig {
  provider: string;
  tokenTtlSeconds: number;
  native: VoipNativeConfig;
}

export interface VoipTokenResponse {
  token: string;
  expiresIn: number;
  callId: string;
  orderId: string;
  provider: string;
  identity: string;
  native: VoipNativeConfig;
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
  detalhe: {
    data: string;
    ganho: number;
    entregas: number;
  }[];
}
