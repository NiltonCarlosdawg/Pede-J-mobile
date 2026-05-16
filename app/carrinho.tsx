import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
  decrementItem,
  incrementItem,
} from "../src/store/cartSlice";
import {
  selectCartItems,
  selectCartSubtotal,
} from "../src/store/cartSelectors";
import { spacing, formatPrice, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

export default function CarrinhoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingBottom: spacing.md },
    content: { flex: 1, paddingHorizontal: spacing.gutter },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl * 2 },
    emptyIcon: { marginBottom: spacing.md, opacity: 0.5 },
    emptyTitle: { ...typography.h3, color: colors.onSurface, marginBottom: spacing.sm },
    emptyText: { ...typography.bodySm, color: colors.neutral[500], textAlign: "center", marginBottom: spacing.lg },
    itemCard: { flexDirection: "row", backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.surfaceVariant },
    itemImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.surfaceContainer },
    itemInfo: { flex: 1, marginLeft: spacing.sm, justifyContent: "center" },
    itemName: { ...typography.labelLg, color: colors.onSurface, marginBottom: 4 },
    itemPrice: { ...typography.bodySm, fontWeight: "600", color: colors.primary[500], marginBottom: spacing.sm },
    itemControls: { flexDirection: "row", alignItems: "center" },
    quantityButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainer, alignItems: "center", justifyContent: "center" },
    quantityText: { ...typography.labelLg, color: colors.onSurface, marginHorizontal: spacing.md },
    subtotalCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant },
    subtotalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
    subtotalLabel: { ...typography.bodySm, color: colors.neutral[700] },
    subtotalValue: { ...typography.labelLg, color: colors.onSurface },
    totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surfaceVariant },
    totalLabel: { ...typography.h3, color: colors.onSurface },
    totalValue: { ...typography.h3, fontWeight: "800", color: colors.primary[500] },
    checkoutButton: { backgroundColor: colors.primary[500], paddingVertical: spacing.md, borderRadius: 20, alignItems: "center", marginTop: spacing.md },
    checkoutText: { ...typography.labelLg, fontWeight: "800", color: colors.white },
    bottomSpacer: { height: 100 },
    addressCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant },
    addressIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary[100], alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
    addressContent: { flex: 1 },
    addressLabel: { ...typography.labelCaps, color: colors.neutral[500], marginBottom: 2 },
    address: { ...typography.bodySm, fontWeight: "600", color: colors.onSurface },
    addressNeighborhood: { ...typography.bodySm, color: colors.neutral[500] },
    changeButton: { ...typography.labelLg, color: colors.primary[500] },
    itemsSection: { gap: spacing.sm },
    itemContent: { flex: 1, justifyContent: "center" },
    itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
    quantityControl: { flexDirection: "row", alignItems: "center" },
    addMoreButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: spacing.md, gap: spacing.sm },
    addMoreText: { ...typography.labelLg, color: colors.primary[500] },
    emptyButton: { backgroundColor: colors.primary[500], paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, borderRadius: 16 },
    emptyButtonText: { ...typography.labelLg, fontWeight: "700", color: colors.white },
    summaryCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant },
    summaryTitle: { ...typography.labelLg, color: colors.onSurface, marginBottom: spacing.sm },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
    summaryLabel: { ...typography.bodySm, color: colors.neutral[500] },
    summaryValue: { ...typography.bodySm, fontWeight: "700", color: colors.onSurface },
    freeDelivery: { color: colors.success },
    divider: { height: 1, backgroundColor: colors.surfaceVariant, marginVertical: spacing.sm },
    checkoutContainer: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.lg, backgroundColor: colors.background },
    checkoutButtonDisabled: { opacity: 0.5 },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meu Carrinho" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={colors.primary[500]}
            />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>ENTREGAR EM</Text>
            <Text style={styles.address}>Rua das Flores, 123 - Apto 45</Text>
            <Text style={styles.addressNeighborhood}>Centro, Luanda</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/endereco")}>
            <Text style={styles.changeButton}>Trocar</Text>
          </TouchableOpacity>
        </View>

        {items.length ? (
          <View style={styles.itemsSection}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{
                    uri:
                      item.image ??
                      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
                  }}
                  style={styles.itemImage}
                />
                <View style={styles.itemContent}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => dispatch(decrementItem(item.id))}
                      >
                        <MaterialCommunityIcons
                          name="minus"
                          size={18}
                          color={colors.primary[500]}
                        />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => dispatch(incrementItem(item.id))}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={18}
                          color={colors.primary[500]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => router.push("/restaurantes")}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={20}
                color={colors.primary[500]}
              />
              <Text style={styles.addMoreText}>Adicionar mais itens</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="shopping-outline"
                size={32}
                color={colors.primary[500]}
              />
            </View>
            <Text style={styles.emptyTitle}>O carrinho está vazio</Text>
            <Text style={styles.emptyText}>
              Explore os restaurantes e adicione pratos para continuar.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/restaurantes")}
            >
              <Text style={styles.emptyButtonText}>Ver restaurantes</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de Entrega</Text>
            <Text style={[styles.summaryValue, styles.freeDelivery]}>Grátis</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, !items.length && styles.checkoutButtonDisabled]}
          onPress={() => router.push("/checkout")}
          disabled={!items.length}
        >
          <Text style={styles.checkoutText}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
