import type { OrderStatus } from '../../store/ordersSlice';

export const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: string; color: string }> = {
  preparing: { label: 'Preparando', icon: 'chef-hat', color: '#fbac1d' },
  ready: { label: 'Pronto', icon: 'package-variant', color: '#4CAF50' },
  delivering: { label: 'Em entrega', icon: 'truck-delivery', color: '#2196F3' },
  delivered: { label: 'Entregue', icon: 'check-circle', color: '#4CAF50' },
  cancelled: { label: 'Cancelado', icon: 'close-circle', color: '#BA1A1A' },
};

export const TRACKING_STEPS = [
  { id: '1', title: 'Pedido Confirmado', time: '19:45', completed: true },
  { id: '2', title: 'Em preparo', time: '19:50', completed: true },
  { id: '3', title: 'Em entrega', time: null, active: true, driver: 'Carlos está a caminho' },
  { id: '4', title: 'Entregue', time: null, completed: false },
];

export const RESTAURANT_IMAGES: Record<string, string> = {
  'order-001': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
  'order-002': 'https://images.unsplash.com/photo-1517248135467-4c7aad601933?w=200',
  'order-003': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200',
  'order-004': 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200',
  'order-005': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
};

export const RESTAURANT_NAMES: Record<string, string> = {
  'order-001': 'Burger Joint Master',
  'order-002': 'Sabor da Praça',
  'order-003': 'Sushi Master',
  'order-004': 'Chicken Station',
  'order-005': 'Burger Joint Master',
};

export function getStatusIndex(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 4,
  };
  return map[status] ?? 1;
}
