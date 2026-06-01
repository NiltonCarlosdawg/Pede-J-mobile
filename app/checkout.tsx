import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sentry from "@sentry/react-native";

import { Header } from "../src/components/ui/Header";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { FALLBACK_ADDRESSES } from "../src/constants/checkoutFallbacks";
import {
  classifyOrderError,
  useSubmitOrderMutation,
} from "../src/hooks/useSubmitOrderMutation";
import type { OrderMutationError } from "../src/hooks/useSubmitOrderMutation";
import { useTheme } from "../src/hooks/useTheme";
import { notifyOrderConfirmed } from "../src/services/notifications";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
  applyCoupon,
  removeCoupon,
  selectAppliedCoupon,
  calculateDiscount,
  selectActiveCoupons,
} from "../src/store/promotionsSlice";
import {
  selectCartItems,
  selectCartRestaurantId,
  selectCartSubtotal,
} from "../src/store/cartSelectors";
import { clearCart } from "../src/store/cartSlice";
import { addOrder } from "../src/store/ordersSlice";
import type { Order as LocalOrder } from "../src/store/ordersSlice";
import { selectPaymentMethods } from "../src/store/paymentMethodsSlice";
import { useGetAddressesQuery } from "../src/hooks/useApi";
import { formatPrice, spacing, typography } from "../src/theme";
import type { Address, PaymentMethod } from "../src/types";

const ROW_HIT_SLOP = { top: 14, bottom: 14, left: 10, right: 10 };
const DEMO_RESTAURANT_ID = "5";
const ORDER_SYNC_WARNING =
  "O pedido foi registado neste dispositivo, mas a confirmação no servidor falhou. Ele ficará visível em 'Meus pedidos' enquanto tenta nova sincronização.";

function buildLocalOrder(params: {
  items: ReturnType<typeof selectCartItems>;
  address: Address;
  payment: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  orderId: string;
}): LocalOrder {
  return {
    id: params.orderId,
    items: params.items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
    })),
    address: {
      id: params.address.id,
      label: params.address.label,
      address: params.address.address,
      neighborhood: params.address.neighborhood,
      city: params.address.city,
    },
    payment: {
      id: params.payment.id,
      type: params.payment.type,
      label: params.payment.label,
    },
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    discount: params.discount,
    total: params.total,
    status: "preparing",
    createdAt: new Date().toISOString(),
    estimatedDelivery: "30-45 min",
  };
}

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const cartRestaurantId = useAppSelector(selectCartRestaurantId);
  const appliedCoupon = useAppSelector(selectAppliedCoupon);
  const activeCoupons = useAppSelector(selectActiveCoupons);
  const paymentMethods = useAppSelector(selectPaymentMethods);
  const { colors } = useTheme();

  const { data: apiAddresses, isFetching: addressesLoading } = useGetAddressesQuery(
    undefined,
    { refetchOnFocus: true, refetchOnReconnect: true }
  );

  const addresses = useMemo((): Address[] => {
    if (apiAddresses && apiAddresses.length > 0) {
      return apiAddresses;
    }
    return FALLBACK_ADDRESSES;
  }, [apiAddresses]);

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderError, setOrderError] = useState<OrderMutationError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const submitMutation = useSubmitOrderMutation();
  const retryPayloadRef = useRef<{
    payload: Record<string, unknown>;
    idempotencyKey: string;
  } | null>(null);

  useEffect(() => {
    if (!addresses.length) return;
    const preferred =
      addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "";
    setSelectedAddress((prev) => {
      if (prev && addresses.some((a) => a.id === prev)) return prev;
      return preferred;
    });
  }, [addresses]);

  useEffect(() => {
    if (!paymentMethods.length) return;
    const preferred =
      paymentMethods.find((p) => p.isDefault)?.id ?? paymentMethods[0]?.id ?? "";
    setSelectedPayment((prev) => {
      if (prev && paymentMethods.some((p) => p.id === prev)) return prev;
      return preferred;
    });
  }, [paymentMethods]);

  const discount = calculateDiscount(subtotal, appliedCoupon);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.background },
        kb: { flex: 1 },
        scrollContent: {
          flexGrow: 1,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.md,
          paddingBottom: spacing.xl,
        },
        heroCard: {
          backgroundColor: colors.primary[100],
          borderRadius: 28,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.secondary[100],
          marginBottom: spacing.md,
        },
        kicker: {
          ...typography.labelCaps,
          color: colors.primary[600],
        },
        title: {
          marginTop: spacing.xs,
          ...typography.h2,
          color: colors.onSurface,
        },
        subtitle: {
          marginTop: spacing.sm,
          ...typography.bodySm,
          color: colors.neutral[700],
        },
        sectionCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          marginBottom: spacing.md,
        },
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.sm,
        },
        sectionTitle: {
          ...typography.h3,
          color: colors.onSurface,
          marginBottom: spacing.sm,
        },
        sectionAction: {
          ...typography.bodySm,
          fontWeight: "700",
          color: colors.primary[500],
        },
        addressOptions: { gap: spacing.md, marginBottom: spacing.md },
        addressItem: {
          flexDirection: "row",
          alignItems: "flex-start",
          padding: spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.neutral[200],
          backgroundColor: colors.neutral[50],
          gap: spacing.md,
          minHeight: 48,
        },
        addressItemSelected: {
          borderColor: colors.primary[500],
          backgroundColor: colors.primary[50],
        },
        addressLabel: {
          ...typography.labelLg,
          color: colors.onSurface,
        },
        addressDetails: {
          ...typography.bodySm,
          color: colors.neutral[600],
          marginTop: 2,
        },
        itemsList: { gap: spacing.sm },
        itemRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        itemQty: {
          ...typography.bodySm,
          color: colors.neutral[600],
          fontWeight: "600",
        },
        itemContent: { flex: 1 },
        itemName: {
          ...typography.bodySm,
          fontWeight: "700",
          color: colors.onSurface,
        },
        itemPrice: {
          ...typography.bodySm,
          fontWeight: "800",
          color: colors.secondary[500],
          marginTop: 2,
        },
        paymentOptions: { gap: spacing.sm },
        paymentItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.neutral[200],
          backgroundColor: colors.neutral[50],
          gap: spacing.md,
          minHeight: 52,
        },
        paymentItemSelected: {
          borderColor: colors.primary[500],
          backgroundColor: colors.primary[50],
        },
        paymentLabel: {
          ...typography.bodySm,
          fontWeight: "600",
          color: colors.neutral[900],
        },
        paymentSubtitle: {
          ...typography.bodySm,
          fontSize: 12,
          color: colors.neutral[600],
          marginTop: 4,
        },
        couponRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
        couponInputWrap: { flex: 1 },
        summaryCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          marginBottom: spacing.lg,
        },
        summaryRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: spacing.xs,
        },
        summaryLabel: {
          ...typography.bodySm,
          color: colors.neutral[700],
        },
        summaryValue: {
          ...typography.bodySm,
          fontWeight: "700",
          color: colors.onSurface,
        },
        freeDelivery: { color: colors.primary[500] },
        divider: {
          height: 1,
          backgroundColor: colors.surfaceVariant,
          marginVertical: spacing.sm,
        },
        totalRow: { flexDirection: "row", justifyContent: "space-between" },
        totalLabel: {
          ...typography.h3,
          fontWeight: "800",
          color: colors.onSurface,
        },
        totalValue: {
          ...typography.priceDisplay,
          fontSize: 22,
          color: colors.secondary[500],
        },
        footerBar: {
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceVariant,
          backgroundColor: colors.background,
        },
        discountApplied: {
          ...typography.bodySm,
          marginTop: spacing.xs,
        },
        discountValue: {
          ...typography.bodySm,
          fontWeight: "600",
        },
        emptyContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.md,
          paddingVertical: spacing.xxl,
        },
        emptyTitle: {
          ...typography.h3,
          color: colors.onSurface,
        },
        emptyText: {
          ...typography.bodySm,
          textAlign: "center",
          color: colors.neutral[700],
          paddingHorizontal: spacing.lg,
        },
        loadingHint: {
          ...typography.bodySm,
          color: colors.neutral[500],
          marginBottom: spacing.sm,
        },
      }),
    [colors]
  );

  const hasItems = items.length > 0;
  const deliveryFee = subtotal > 25 ? 0 : 5.9;
  const total = subtotal + deliveryFee - discount;

  const currentAddress = addresses.find((a) => a.id === selectedAddress);
  const currentPayment = paymentMethods.find((p) => p.id === selectedPayment);

  function paymentSubtitle(method: PaymentMethod) {
    const descriptions: Record<string, string> = {
      paypay: "Carteira digital BFA - Confirmação com PIN",
      multicaixa_express: "Referência para pagamento em ATM",
      unitel_money: "Carteira digital Unitel",
      facipay: "Pagamento direto via app FaciPay",
    };
    return descriptions[method.type] || method.label;
  }

  const handleApplyCoupon = () => {
    Keyboard.dismiss();
    if (!couponCode.trim()) return;

    const coupon = activeCoupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (!coupon) {
      setCouponError("Cupão inválido ou expirado");
      return;
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setCouponError(`Pedido mínimo de Kz ${coupon.minOrderValue}`);
      return;
    }

    dispatch(applyCoupon(couponCode.trim()));
    setCouponError("");
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponError("");
  };

  type SubmitResult = {
    remoteId?: string;
    error?: OrderMutationError;
    fatal?: boolean;
  };

  const doSubmitOrder = useCallback(
    async (retrying = false): Promise<SubmitResult> => {
      const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

      const payload = {
        restaurantId: cartRestaurantId ?? DEMO_RESTAURANT_ID,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        addressId: currentAddress?.id ?? "",
        paymentMethod: `${currentPayment?.type ?? ""}:${currentPayment?.label ?? ""}`,
      };

      retryPayloadRef.current = { payload, idempotencyKey };
      setOrderError(null);

      try {
        const data = await submitMutation.mutateAsync({
          body: payload,
          idempotencyKey,
        });
        return { remoteId: data && typeof data === "object" && "id" in data ? String((data as { id: unknown }).id) : undefined };
      } catch (error) {
        const classified = classifyOrderError(error);
        Sentry.captureException(error);

        if (
          !retrying &&
          (classified.type === "SERVER_ERROR" || classified.type === "TIMEOUT_ERROR" || classified.type === "NETWORK_ERROR")
        ) {
          setOrderError(classified);
          return { error: classified };
        }

        if (classified.type === "VALIDATION_ERROR" || classified.type === "CONFLICT_ERROR") {
          setOrderError(classified);
          return { error: classified, fatal: true };
        }

        return { error: classified };
      }
    },
    [currentAddress, currentPayment, cartRestaurantId, items, submitMutation]
  );

  const handleConfirmOrder = async () => {
    if (!hasItems || !currentAddress || !currentPayment || submitMutation.isPending) return;

    setRetryCount(0);

    const result = await doSubmitOrder();

    if (result.fatal) {
      return;
    }

    const orderId = result.remoteId ?? `local-${Date.now()}`;
    const apiFailed = !!result.error;

    const order = buildLocalOrder({
      items,
      address: currentAddress,
      payment: currentPayment,
      subtotal,
      deliveryFee,
      discount,
      total,
      orderId,
    });

    dispatch(addOrder(order));
    dispatch(clearCart());

    await notifyOrderConfirmed(order.id, "Restaurante");

    router.push({
      pathname: "/payment-flow",
      params: {
        orderId: order.id,
        methodId: currentPayment?.id ?? "",
      },
    });
  };

  const handleRetry = async () => {
    if (!retryPayloadRef.current || !currentAddress || !currentPayment || submitMutation.isPending) return;

    setRetryCount((prev) => prev + 1);

    const result = await doSubmitOrder(true);
    if (result.fatal) return;

    const orderId = result.remoteId ?? `local-${Date.now()}`;
    const apiFailed = !!result.error;

    const order = buildLocalOrder({
      items,
      address: currentAddress,
      payment: currentPayment,
      subtotal,
      deliveryFee,
      discount,
      total,
      orderId,
    });

    dispatch(addOrder(order));
    dispatch(clearCart());

    await notifyOrderConfirmed(order.id, "Restaurante");

    router.push({
      pathname: "/payment-flow",
      params: {
        orderId: order.id,
        methodId: currentPayment?.id ?? "",
      },
    });
  };

  const confirming = submitMutation.isPending;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Header title="Checkout" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.kb}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={!confirming}
        >
          {!hasItems ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="cart-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyTitle}>Carrinho vazio</Text>
              <Text style={styles.emptyText}>
                Adicione itens no restaurante para fazer checkout.
              </Text>
              <Button title="Voltar ao restaurante" onPress={() => router.back()} />
            </View>
          ) : (
            <>
              {addressesLoading ? (
                <Text style={styles.loadingHint}>A carregar endereços…</Text>
              ) : null}

              <View style={styles.heroCard}>
                <Text style={styles.kicker}>Finalize sua compra</Text>
                <Text style={styles.title}>Revise e confirme</Text>
                <Text style={styles.subtitle}>
                  Verifique seus itens, endereço e método de pagamento.
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/endereco")}
                    hitSlop={ROW_HIT_SLOP}
                    disabled={confirming}
                  >
                    <Text style={styles.sectionAction}>Editar</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addressOptions}>
                  {addresses.map((address) => (
                    <Pressable
                      key={address.id}
                      hitSlop={ROW_HIT_SLOP}
                      disabled={confirming}
                      onPress={() => setSelectedAddress(address.id)}
                      style={[
                        styles.addressItem,
                        selectedAddress === address.id && styles.addressItemSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          selectedAddress === address.id ? "radiobox-marked" : "radiobox-blank"
                        }
                        size={22}
                        color={
                          selectedAddress === address.id
                            ? colors.primary[500]
                            : colors.neutral[300]
                        }
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        <Text style={styles.addressDetails}>
                          {address.address}, {address.neighborhood}, {address.city}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                <View style={styles.itemsList}>
                  {items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{item.quantity}x</Text>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemName}>{item.title}</Text>
                        <Text style={styles.itemPrice}>
                          {formatPrice(item.price * item.quantity)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Método de Pagamento</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/payment-methods")}
                    hitSlop={ROW_HIT_SLOP}
                    disabled={confirming}
                  >
                    <Text style={styles.sectionAction}>Gerenciar</Text>
                  </TouchableOpacity>
                </View>
                {paymentMethods.length === 0 ? (
                  <Button
                    title="Adicionar método de pagamento"
                    onPress={() => router.push("/payment-methods")}
                    disabled={confirming}
                  />
                ) : (
                  <View style={styles.paymentOptions}>
                    {paymentMethods.map((method) => (
                      <Pressable
                        key={method.id}
                        hitSlop={ROW_HIT_SLOP}
                        disabled={confirming}
                        onPress={() => setSelectedPayment(method.id)}
                        style={[
                          styles.paymentItem,
                          selectedPayment === method.id && styles.paymentItemSelected,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            selectedPayment === method.id ? "radiobox-marked" : "radiobox-blank"
                          }
                          size={22}
                          color={
                            selectedPayment === method.id
                              ? colors.primary[500]
                              : colors.neutral[300]
                          }
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentLabel}>{method.label}</Text>
                          <Text style={styles.paymentSubtitle}>{paymentSubtitle(method)}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Código de Desconto</Text>
                <View style={styles.couponRow}>
                  <View style={styles.couponInputWrap}>
                    <Input
                      placeholder="Inserir código"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      icon="ticket-percent"
                      iconPosition="left"
                      disabled={confirming}
                      onSubmitEditing={handleApplyCoupon}
                      returnKeyType="send"
                    />
                  </View>
                  <View style={{ paddingTop: 4 }}>
                    <Button
                      title="Aplicar"
                      onPress={handleApplyCoupon}
                      variant="secondary"
                      size="small"
                      disabled={confirming}
                    />
                  </View>
                </View>
                {couponError ? (
                  <Text style={[styles.discountApplied, { color: colors.error }]}>
                    {couponError}
                  </Text>
                ) : null}
                {appliedCoupon ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.sm,
                      marginTop: spacing.xs,
                    }}
                  >
                    <Text style={[styles.discountApplied, { color: colors.primary[500] }]}>
                      ✓ {appliedCoupon.description} (- {formatPrice(discount)})
                    </Text>
                    <TouchableOpacity
                      onPress={handleRemoveCoupon}
                      hitSlop={ROW_HIT_SLOP}
                      disabled={confirming}
                    >
                      <MaterialCommunityIcons name="close-circle" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Entrega</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      deliveryFee === 0 && styles.freeDelivery,
                    ]}
                  >
                    {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
                  </Text>
                </View>
                {discount > 0 ? (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Desconto</Text>
                    <Text style={[styles.summaryValue, styles.discountValue]}>
                      - {formatPrice(discount)}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {hasItems && paymentMethods.length > 0 ? (
            <SafeAreaView edges={["bottom"]} style={styles.footerBar}>
              {orderError ? (
                <View style={{ gap: spacing.sm }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: spacing.sm,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      backgroundColor:
                        orderError.type === "VALIDATION_ERROR"
                          ? colors.neutral[100]
                          : colors.secondary[100],
                      borderRadius: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        orderError.type === "VALIDATION_ERROR"
                          ? "alert-circle"
                          : "alert"
                      }
                      size={20}
                      color={
                        orderError.type === "VALIDATION_ERROR"
                          ? colors.error
                          : colors.warning
                      }
                    />
                    <Text
                      style={{
                        flex: 1,
                        ...typography.bodySm,
                        color:
                          orderError.type === "VALIDATION_ERROR"
                            ? colors.error
                            : colors.neutral[700],
                      }}
                    >
                      {orderError.message}
                    </Text>
                  </View>

                  {orderError.type !== "VALIDATION_ERROR" &&
                    orderError.type !== "CONFLICT_ERROR" && (
                      <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <View style={{ flex: 1 }}>
                          <Button
                            title="Tentar novamente"
                            onPress={handleRetry}
                            loading={submitMutation.isPending}
                            variant="secondary"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            title="Registar localmente"
                            onPress={handleConfirmOrder}
                            disabled={submitMutation.isPending}
                            variant="ghost"
                          />
                        </View>
                      </View>
                    )}

                  {(orderError.type === "VALIDATION_ERROR" ||
                    orderError.type === "CONFLICT_ERROR") && (
                    <Button
                      title="Voltar"
                      onPress={() => router.back()}
                      variant="ghost"
                    />
                  )}
                </View>
              ) : (
                <Button
                  title={confirming ? "A processar…" : "Confirmar pedido"}
                  onPress={handleConfirmOrder}
                  disabled={confirming || !currentAddress || !currentPayment}
                  loading={confirming}
                />
              )}
            </SafeAreaView>
          ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
