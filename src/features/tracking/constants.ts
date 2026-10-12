import type { OrderStatus } from '../../store/ordersSlice';

export const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: string; color: string }> = {
  pending: { label: 'Aguarda restaurante', icon: 'clock-outline', color: '#9E9E9E' },
  confirmed: { label: 'Confirmado', icon: 'check', color: '#2196F3' },
  preparing: { label: 'Preparando', icon: 'chef-hat', color: '#fbac1d' },
  ready: { label: 'Pronto', icon: 'package-variant', color: '#4CAF50' },
  delivering: { label: 'Em entrega', icon: 'truck-delivery', color: '#2196F3' },
  delivered: { label: 'Entregue', icon: 'check-circle', color: '#4CAF50' },
  cancelled: { label: 'Cancelado', icon: 'close-circle', color: '#BA1A1A' },
};

export const TRACKING_STEPS = [
  { id: '1', title: 'Pedido Confirmado', status: 'confirmed' },
  { id: '2', title: 'Em preparo', status: 'preparing' },
  { id: '3', title: 'Em entrega', status: 'delivering' },
  { id: '4', title: 'Entregue', status: 'delivered' },
];

/** Primeiro timestamp de cada estado na timeline do servidor (ou null). */
export function stepTimes(timeline?: { status: string; timestamp: string }[]) {
  const times: Record<string, string | null> = {
    confirmed: null,
    preparing: null,
    delivering: null,
    delivered: null,
  };
  for (const t of timeline ?? []) {
    const key =
      t.status === 'confirmed' ? 'confirmed'
      : t.status === 'preparing' || t.status === 'ready' ? 'preparing'
      : t.status === 'delivering' ? 'delivering'
      : t.status === 'delivered' ? 'delivered'
      : null;
    if (key && !times[key]) times[key] = t.timestamp;
  }
  return times;
}

export function formatStepTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusIndex(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 4,
  };
  return map[status] ?? 1;
}
