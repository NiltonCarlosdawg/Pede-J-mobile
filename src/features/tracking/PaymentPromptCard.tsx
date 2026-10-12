import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import {
  useGetOrderByIdQuery,
  useGetOrderPaymentsQuery,
  useRetryDeliveryPaymentMutation,
} from '../../hooks/useApi';
import { formatPrice, spacing } from '../../theme';
import { paymentPromptFor } from './paymentPrompt';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectOrders, updateOrderStatus, type OrderStatus } from '../../store/ordersSlice';

const SERVER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
  'cancelled',
];

/**
 * Cartão de pagamentos no acompanhamento: mostra o estado real dos dois
 * pushes (servidor) e leva ao payment-flow para autorizar/repetir.
 * Sem dados inventados — tudo vem de GET orders/:id + payments.
 */
export function PaymentPromptCard({ orderId }: { orderId: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');

  const { data: detail } = useGetOrderByIdQuery(orderId, { pollingInterval: 8000 });
  const { data: paymentsData } = useGetOrderPaymentsQuery(orderId, { pollingInterval: 8000 });
  const [retryDelivery] = useRetryDeliveryPaymentMutation();
  const dispatch = useAppDispatch();
  const localOrder = useAppSelector((s) => selectOrders(s).find((o) => o.id === orderId));

  const serverStatus =
    (detail as unknown as { order?: { status?: string } } | undefined)?.order?.status;

  // Sincroniza o estado local com o servidor (fonte de verdade) para os
  // passos do acompanhamento não ficarem presos no estado do checkout.
  const syncedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!serverStatus || syncedRef.current === `${orderId}:${serverStatus}`) return;
    syncedRef.current = `${orderId}:${serverStatus}`;
    if (
      localOrder &&
      localOrder.status !== serverStatus &&
      (SERVER_STATUSES as string[]).includes(serverStatus)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync servidor→local
      dispatch(updateOrderStatus({ orderId, status: serverStatus as OrderStatus }));
    }
  }, [serverStatus, orderId, localOrder, dispatch]);
  const payments = useMemo(() => paymentsData?.payments ?? [], [paymentsData]);
  const prompt = useMemo(
    () => (serverStatus ? paymentPromptFor(serverStatus, payments) : null),
    [serverStatus, payments],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        highlight: {
          borderColor: colors.primary[500],
          backgroundColor: colors.primary[50],
        },
        row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        title: { fontSize: 15, fontWeight: '800', color: colors.onSurface, flex: 1 },
        sub: { fontSize: 13, color: colors.neutral[600], marginTop: 4, lineHeight: 19 },
        amount: { fontSize: 22, fontWeight: '800', color: colors.primary[500], marginTop: 6 },
        button: {
          marginTop: spacing.sm,
          backgroundColor: colors.primary[500],
          borderRadius: 12,
          paddingVertical: spacing.sm,
          alignItems: 'center',
        },
        buttonText: { fontSize: 14, fontWeight: '800', color: colors.white },
        error: { fontSize: 13, color: colors.error, marginTop: spacing.xs, textAlign: 'center' },
      }),
    [colors],
  );

  if (!prompt || prompt.kind === 'none') return null;

  const goPaymentFlow = (paymentId?: string) =>
    router.push({ pathname: '/payment-flow', params: paymentId ? { orderId, paymentId } : { orderId } });

  async function handleDeliveryRetry() {
    setRetrying(true);
    setRetryError('');
    try {
      const res = await retryDelivery({
        orderId,
        idempotencyKey: `${orderId}-delivery-retry-${Date.now()}`,
      }).unwrap();
      if (!res.payment?.id) {
        setRetryError('Sem telefone MCX. Actualize o telefone no perfil e tente de novo.');
        return;
      }
      goPaymentFlow(res.payment.id);
    } catch {
      setRetryError('Não foi possível gerar novo push. Tente novamente.');
    } finally {
      setRetrying(false);
    }
  }

  if (prompt.kind === 'awaiting-confirmation') {
    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="clock-outline" size={22} color={colors.neutral[500]} />
          <Text style={styles.title}>A aguardar o restaurante</Text>
        </View>
        <Text style={styles.sub}>
          O restaurante ainda não confirmou o pedido. O pagamento dos produtos é pedido a seguir,
          no seu telemóvel.
        </Text>
      </View>
    );
  }

  if (prompt.kind === 'pay-products' || prompt.kind === 'pay-delivery') {
    const isDelivery = prompt.kind === 'pay-delivery';
    return (
      <View style={[styles.card, styles.highlight]}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="cellphone-message" size={22} color={colors.primary[500]} />
          <Text style={styles.title}>
            {isDelivery ? 'Confirme a taxa de entrega' : 'Confirme o pagamento'}
          </Text>
        </View>
        <Text style={styles.amount}>{formatPrice(prompt.payment.amount)}</Text>
        <Text style={styles.sub}>
          {isDelivery
            ? 'Um pedido de pagamento foi enviado para o seu telemóvel. Confirme no app do banco.'
            : 'O restaurante confirmou o pedido. Confirme no app do banco para começar o preparo.'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => goPaymentFlow(prompt.payment.id)}>
          <Text style={styles.buttonText}>Ver pagamento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (prompt.kind === 'products-failed') {
    return (
      <View style={[styles.card, styles.highlight]}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.primary[500]} />
          <Text style={styles.title}>Pagamento por concluir</Text>
        </View>
        <Text style={styles.sub}>
          O pedido está confirmado mas os produtos ainda não foram pagos. Toque para gerar novo
          pedido de pagamento.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => goPaymentFlow()}>
          <Text style={styles.buttonText}>Pagar produtos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.highlight]}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="alert-circle-outline" size={22} color={colors.primary[500]} />
        <Text style={styles.title}>Taxa de entrega por pagar</Text>
      </View>
      <Text style={styles.sub}>
        O push da taxa de entrega expirou ou falhou. Gere um novo push para concluir.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleDeliveryRetry} disabled={retrying}>
        {retrying ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Gerar novo push</Text>
        )}
      </TouchableOpacity>
      {retryError ? <Text style={styles.error}>{retryError}</Text> : null}
    </View>
  );
}
