import { paymentPromptFor } from '../paymentPrompt';
import type { PaymentResponse } from '../../../types';

const tx = (over: Partial<PaymentResponse>): PaymentResponse => ({
  id: 'tx',
  orderId: 'order',
  purpose: 'products',
  amount: 2000,
  paymentMethod: { id: 'm', type: 'multicaixa_express', label: 'Multicaixa Express', isDefault: true },
  status: 'processing',
  timestamp: new Date().toISOString(),
  ...over,
});

describe('paymentPromptFor', () => {
  it('pending mostra espera pela confirmação do restaurante', () => {
    expect(paymentPromptFor('pending', [])).toEqual({ kind: 'awaiting-confirmation' });
  });

  it('push 1 em curso pede confirmação no telemóvel', () => {
    const p = tx({ purpose: 'products', status: 'processing' });
    expect(paymentPromptFor('confirmed', [p])).toEqual({ kind: 'pay-products', payment: p });
  });

  it('push 1 legado em curso também pede confirmação', () => {
    const p = tx({ purpose: null, status: 'processing' });
    expect(paymentPromptFor('confirmed', [p])).toEqual({ kind: 'pay-products', payment: p });
  });

  it('produtos pagos não mostram nada', () => {
    expect(
      paymentPromptFor('preparing', [tx({ purpose: 'products', status: 'completed' })]),
    ).toEqual({ kind: 'none' });
  });

  it('confirmado sem tx nenhuma permite repetir o push', () => {
    expect(paymentPromptFor('confirmed', [])).toEqual({ kind: 'products-failed' });
  });

  it('push 2 em curso após entrega pede a taxa de entrega', () => {
    const p = tx({ purpose: 'delivery', status: 'processing', amount: 500 });
    expect(
      paymentPromptFor('delivered', [tx({ purpose: 'products', status: 'completed' }), p]),
    ).toEqual({ kind: 'pay-delivery', payment: p });
  });

  it('push 2 falhado permite gerar novo push', () => {
    expect(
      paymentPromptFor('delivered', [tx({ purpose: 'delivery', status: 'failed', amount: 500 })]),
    ).toEqual({ kind: 'delivery-failed' });
  });

  it('entregue sem push 2 ainda não mostra nada (a gerar)', () => {
    expect(paymentPromptFor('delivered', [])).toEqual({ kind: 'none' });
  });
});
