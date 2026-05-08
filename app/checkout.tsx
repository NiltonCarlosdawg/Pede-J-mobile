import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import { clearCart, selectCartItems, selectCartSubtotal } from "../src/store/cartSlice";
import { colors, spacing, formatPrice } from "../src/theme";

const PAYMENT_METHODS = [
  {
    id: "1",
    label: "Multicaixa Express",
    subtitle: "Pagamento no acto de entrega",
    active: true,
  },
  {
    id: "2",
    label: "Cartão",
    subtitle: "Cartão guardado terminando em 4242",
  },
  {
    id: "3",
    label: "Dinheiro",
    subtitle: "Pagar em numerário ao entregador",
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const [selectedPayment, setSelectedPayment] = useState("1");
  const [coupon, setCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasItems = items.length > 0;

  async function handleConfirmOrder() {
    if (!hasItems || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    dispatch(clearCart());
    setIsSubmitting(false);
    router.push("/pedidos");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Checkout" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Pedido pronto para confirmar</Text>
          <Text style={styles.title}>Revisar e concluir compra</Text>
          <Text style={styles.subtitle}>
            Base de checkout demo enquanto o backend não está ligado.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entrega</Text>
            <TouchableOpacity onPress={() => router.push("/endereco")}>
              <Text style={styles.sectionAction}>Alterar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.primary[500]}
            />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Rua das Flores, 123 - Apto 45</Text>
              <Text style={styles.addressMeta}>Centro, Luanda</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Itens do pedido</Text>
          {hasItems ? (
            items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <MaterialCommunityIcons
                    name="food"
                    size={18}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.title}</Text>
                  <Text style={styles.itemMeta}>Quantidade: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="cart-outline"
                size={28}
                color={colors.neutral[500]}
              />
              <Text style={styles.emptyTitle}>Carrinho vazio</Text>
              <Text style={styles.emptyText}>
                Adiciona itens no restaurante para continuar o checkout.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Método de pagamento</Text>
          {PAYMENT_METHODS.map((method) => {
            const active = selectedPayment === method.id;

            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentRow, active && styles.paymentRowActive]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View style={styles.paymentRadio}>
                  {active ? <View style={styles.paymentRadioDot} /> : null}
                </View>
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentTitle}>{method.label}</Text>
                  <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Cupão</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Inserir cupão"
              placeholderTextColor={colors.neutral[500]}
              value={coupon}
              onChangeText={setCoupon}
            />
            <TouchableOpacity style={styles.couponButton}>
              <Text style={styles.couponButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Entrega</Text>
            <Text style={[styles.summaryValue, styles.freeDelivery]}>Grátis</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto</Text>
            <Text style={styles.summaryValue}>- Kz 0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <TouchableOpacity
          style={[styles.confirmButton, (!hasItems || isSubmitting) && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={!hasItems || isSubmitting}
        >
          <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: 120,
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.primary[600],
  },
  title: {
    marginTop: spacing.xs,
    fontSize: 28,
    fontWeight: "800",
    color: colors.onSurface,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary[500],
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  addressMeta: {
    marginTop: 2,
    fontSize: 13,
    color: colors.neutral[700],
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.neutral[700],
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.secondary[500],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    color: colors.neutral[700],
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  paymentRowActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  paymentSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.neutral[700],
  },
  couponRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    fontSize: 14,
    color: colors.onSurface,
  },
  couponButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary[500],
    justifyContent: "center",
  },
  couponButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
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
    fontSize: 14,
    color: colors.neutral[700],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  freeDelivery: {
    color: colors.primary[500],
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.secondary[500],
  },
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.gutter,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.55,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
});
