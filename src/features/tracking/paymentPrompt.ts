import type { PaymentResponse } from '../../types';

export type PaymentPrompt =
  | { kind: 'awaiting-confirmation' }
  | { kind: 'pay-products'; payment: PaymentResponse }
  | { kind: 'products-failed' }
  | { kind: 'pay-delivery'; payment: PaymentResponse }
  | { kind: 'delivery-failed' }
  | { kind: 'none' };

const isLive = (p: PaymentResponse) => p.status === 'pending' || p.status === 'processing';

/**
 * Decide o que mostrar ao cliente sobre pagamentos, a partir do estado do
 * pedido (servidor) e da lista de pagamentos (push 1 = produtos, push 2 =
 * entrega). Sem dados inventados: cada ramo tem origem numa tx real ou
 * na ausência dela.
 */
export function paymentPromptFor(
  orderStatus: string,
  payments: PaymentResponse[],
): PaymentPrompt {
  const byPurpose = (purpose: 'products' | 'delivery' | null) =>
    payments.filter((p) => (p.purpose ?? null) === purpose);

  if (orderStatus === 'pending') return { kind: 'awaiting-confirmation' };

  if (orderStatus === 'delivered') {
    const live = byPurpose('delivery').find(isLive);
    if (live) return { kind: 'pay-delivery', payment: live };
    if (byPurpose('delivery').length > 0) return { kind: 'delivery-failed' };
    return { kind: 'none' };
  }

  const productTxs = [...byPurpose('products'), ...byPurpose(null)];
  const live = productTxs.find(isLive);
  if (live) return { kind: 'pay-products', payment: live };
  if (productTxs.some((p) => p.status === 'completed')) return { kind: 'none' };
  if (orderStatus === 'confirmed') return { kind: 'products-failed' };
  return { kind: 'none' };
}
