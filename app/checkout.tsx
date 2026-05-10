import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { useAppDispatch, useAppSelector } from "../src/store";
import { clearCart, selectCartItems, selectCartSubtotal } from "../src/store/cartSlice";
import { addOrder } from "../src/store/ordersSlice";
import { notifyOrderConfirmed } from "../src/services/notifications";
import { spacing, formatPrice } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";
import type { PaymentMethod, Address } from "../src/types";

// Mock data
const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr1",
    label: "Casa",
    address: "Rua das Flores, 123 - Apto 45",
    neighborhood: "Centro",
    city: "Luanda",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "Trabalho",
    address: "Av. Kwame Nkrumah, 500 - Sala 201",
    neighborhood: "Kinaxixi",
    city: "Luanda",
    isDefault: false,
  },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm1",
    type: "credit_card",
    label: "MCX",
    isDefault: true,
    cardNumber: "4242",
    cardHolder: "JOÃO SILVA",
    expiryDate: "12/25",
    brand: "MCX",
  },
  {
    id: "pm2",
    type: "wallet",
    label: "Unitel Money",
    isDefault: false,
    pixKey: "+244923456789",
  },
  {
    id: "pm3",
    type: "wallet",
    label: "PAYPAY",
    isDefault: false,
    pixKey: "paypay@email.com",
  },
  {
    id: "pm4",
    type: "wallet",
    label: "Kwik",
    isDefault: false,
    pixKey: "+244943456789",
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const { colors } = useTheme();
  
  const [selectedAddress, setSelectedAddress] = useState<string>(MOCK_ADDRESSES[0].id);
  const [selectedPayment, setSelectedPayment] = useState<string>(MOCK_PAYMENT_METHODS[0].id);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingBottom: 16 },
    content: { flex: 1, paddingHorizontal: spacing.gutter, paddingTop: spacing.md, paddingBottom: 120 },
    heroCard: { backgroundColor: colors.primary[100], borderRadius: 28, padding: spacing.lg, borderWidth: 1, borderColor: colors.secondary[100], marginBottom: spacing.md },
    kicker: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", color: colors.primary[600] },
    title: { marginTop: spacing.xs, fontSize: 28, fontWeight: "800", color: colors.onSurface },
    subtitle: { marginTop: spacing.sm, fontSize: 14, lineHeight: 20, color: colors.neutral[700] },
    sectionCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant, marginBottom: spacing.md },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface, marginBottom: spacing.sm },
    sectionAction: { fontSize: 14, fontWeight: "700", color: colors.primary[500] },
    addressCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: 18, backgroundColor: colors.surfaceContainer },
    addressContent: { flex: 1 },
    addressLabel: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
    addressMeta: { marginTop: 2, fontSize: 13, color: colors.neutral[700] },
    itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceVariant },
    itemIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary[100], alignItems: "center", justifyContent: "center" },
    itemContent: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
    itemMeta: { marginTop: 2, fontSize: 12, color: colors.neutral[700] },
    itemPrice: { fontSize: 14, fontWeight: "800", color: colors.secondary[500] },
    emptyState: { alignItems: "center", paddingVertical: spacing.md, gap: 6 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
    emptyText: { fontSize: 13, textAlign: "center", color: colors.neutral[700] },
    paymentRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: 18, backgroundColor: colors.surfaceContainer, marginBottom: spacing.sm, borderWidth: 1, borderColor: "transparent" },
    paymentRowActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[100] },
    paymentRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary[500], alignItems: "center", justifyContent: "center" },
    paymentRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary[500] },
    paymentContent: { flex: 1 },
    paymentTitle: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
    paymentSubtitle: { marginTop: 2, fontSize: 12, color: colors.neutral[700] },
    couponRow: { flexDirection: "row", gap: spacing.sm },
    couponInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surfaceContainer, fontSize: 14, color: colors.onSurface },
    couponButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.primary[500], justifyContent: "center" },
    couponButtonText: { fontSize: 13, fontWeight: "700", color: colors.white },
    summaryCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant, marginBottom: spacing.lg },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
    summaryLabel: { fontSize: 14, color: colors.neutral[700] },
    summaryValue: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
    freeDelivery: { color: colors.primary[500] },
    divider: { height: 1, backgroundColor: colors.surfaceVariant, marginVertical: spacing.sm },
    totalRow: { flexDirection: "row", justifyContent: "space-between" },
    totalLabel: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
    totalValue: { fontSize: 20, fontWeight: "800", color: colors.secondary[500] },
    checkoutBar: { position: "absolute", left: 0, right: 0, bottom: 0, padding: spacing.gutter, paddingBottom: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.surfaceVariant },
    confirmButton: { backgroundColor: colors.primary[500], paddingVertical: 14, borderRadius: 18, alignItems: "center" },
    confirmButtonDisabled: { opacity: 0.55 },
    confirmButtonText: { fontSize: 16, fontWeight: "800", color: colors.white },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
    addressOptions: { gap: spacing.md, marginBottom: spacing.md },
    addressItem: { flexDirection: "row", alignItems: "flex-start", padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.neutral[200], backgroundColor: colors.neutral[50], gap: spacing.md },
    addressItemSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
    addressInfo: { flex: 1 },
    addressDetails: { fontSize: 13, color: colors.neutral[600] },
    itemsList: { gap: spacing.sm },
    itemQuantity: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    itemQty: { fontSize: 12, color: colors.neutral[600] },
    paymentOptions: { gap: spacing.sm },
    paymentItem: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.neutral[200], backgroundColor: colors.neutral[50], gap: spacing.md },
    paymentItemSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
    paymentInfo: { flex: 1 },
    paymentLabel: { fontSize: 14, fontWeight: "600", color: colors.neutral[900] },
    discountApplied: { fontSize: 12, color: colors.primary[500], marginTop: 4 },
    discountValue: { fontSize: 14, color: colors.primary[500], fontWeight: "600" },
  }), [colors]);
  
  const hasItems = items.length > 0;
  const deliveryFee = subtotal > 25 ? 0 : 5.9;
  const total = subtotal + deliveryFee - discount;
  
  const currentAddress = MOCK_ADDRESSES.find((a) => a.id === selectedAddress);
  const currentPayment = MOCK_PAYMENT_METHODS.find((p) => p.id === selectedPayment);

  const handleApplyCoupon = () => {
    if (!coupon) return;
    
    // Simple demo: apply 10% discount if coupon is "DESCONTO10"
    if (coupon.toUpperCase() === "DESCONTO10") {
      const discountAmount = Math.round(subtotal * 0.1);
      setDiscount(discountAmount);
      Alert.alert("Sucesso", `Cupão aplicado! Desconto de Kz ${discountAmount}`);
      setCoupon("");
    } else {
      Alert.alert("Erro", "Cupão inválido");
    }
  };

  async function handleConfirmOrder() {
    if (!hasItems || !currentAddress || !currentPayment || isSubmitting) {
      return;
    }

    if (!selectedAddress) {
      Alert.alert("Erro", "Selecione um endereço de entrega");
      return;
    }

    if (!selectedPayment) {
      Alert.alert("Erro", "Selecione um método de pagamento");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const order = {
        id: `order-${Date.now()}`,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        address: {
          id: currentAddress.id,
          label: currentAddress.label,
          address: currentAddress.address,
          neighborhood: currentAddress.neighborhood,
          city: currentAddress.city,
        },
        payment: {
          id: currentPayment.id,
          type: currentPayment.type,
          label: currentPayment.label,
        },
        subtotal,
        deliveryFee,
        discount,
        total,
        status: "preparing" as const,
        createdAt: new Date().toISOString(),
        estimatedDelivery: "30-45 min",
      };

      dispatch(addOrder(order));
      dispatch(clearCart());

      // Notifica o usuário sobre o pedido confirmado
      await notifyOrderConfirmed(order.id, "Restaurante");

      router.push("/(auth)/order-success");
    } catch (error) {
      console.error("[checkout] error:", error);
      Alert.alert("Erro", "Não foi possível confirmar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Checkout" showBack onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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
            <Button
              title="Voltar ao restaurante"
              onPress={() => router.back()}
            />
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.kicker}>Finalize sua compra</Text>
              <Text style={styles.title}>Revise e confirme</Text>
              <Text style={styles.subtitle}>
                Verifique seus itens, endereço e método de pagamento.
              </Text>
            </View>

            {/* Address Selection */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
                <TouchableOpacity onPress={() => router.push("/endereco")}>
                  <Text style={styles.sectionAction}>Editar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addressOptions}>
                {MOCK_ADDRESSES.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    onPress={() => setSelectedAddress(address.id)}
                    style={[
                      styles.addressItem,
                      selectedAddress === address.id && styles.addressItemSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={selectedAddress === address.id ? "radiobox-marked" : "radiobox-blank"}
                      size={20}
                      color={
                        selectedAddress === address.id
                          ? colors.primary[500]
                          : colors.neutral[300]
                      }
                    />
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressDetails}>
                        {address.address}, {address.neighborhood}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cart Items */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Itens do Pedido</Text>
              <View style={styles.itemsList}>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemQuantity}>
                      <Text style={styles.itemQty}>{item.quantity}x</Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.title}</Text>
                      <Text style={styles.itemPrice}>
                        Kz {(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Método de Pagamento</Text>
                <TouchableOpacity onPress={() => router.push("/payment-methods")}>
                  <Text style={styles.sectionAction}>Gerenciar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.paymentOptions}>
                {MOCK_PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedPayment(method.id)}
                    style={[
                      styles.paymentItem,
                      selectedPayment === method.id && styles.paymentItemSelected,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={selectedPayment === method.id ? "radiobox-marked" : "radiobox-blank"}
                      size={20}
                      color={
                        selectedPayment === method.id
                          ? colors.primary[500]
                          : colors.neutral[300]
                      }
                    />
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentLabel}>
                        {method.type === "credit_card"
                          ? `${method.brand} ••${method.cardNumber}`
                          : method.type === "pix"
                          ? "PIX"
                          : method.label}
                      </Text>
                      <Text style={styles.paymentSubtitle}>{method.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Coupon Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Código de Desconto</Text>
              <View style={styles.couponRow}>
                <Input
                  placeholder="Inserir código"
                  value={coupon}
                  onChangeText={setCoupon}
                  icon="ticket-percent"
                  iconPosition="left"
                />
                <Button
                  title="Aplicar"
                  onPress={handleApplyCoupon}
                  variant="secondary"
                  size="small"
                />
              </View>
              {discount > 0 && (
                <Text style={styles.discountApplied}>
                  ✓ Desconto de Kz {discount.toFixed(2)} aplicado
                </Text>
              )}
            </View>

            {/* Order Summary */}
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
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Desconto</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>
                    - {formatPrice(discount)}
                  </Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {hasItems && (
        <View style={styles.checkoutBar}>
          <Button
            title={isSubmitting ? "Confirmando..." : "Confirmar Pedido"}
            onPress={handleConfirmOrder}
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

