import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppSelector } from "../src/store";
import { selectOrders, selectCurrentOrder } from "../src/store/ordersSlice";
import { spacing, formatPrice } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

const STATUS_CONFIG = {
  preparing: { label: "Preparando", icon: "chef-hat", color: "#fbac1d" },
  ready: { label: "Pronto", icon: "package-variant", color: "#4CAF50" },
  delivering: { label: "Em entrega", icon: "truck-delivery", color: "#2196F3" },
  delivered: { label: "Entregue", icon: "check-circle", color: "#4CAF50" },
  cancelled: { label: "Cancelado", icon: "close-circle", color: "#BA1A1A" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const orders = useAppSelector(selectOrders);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const { colors: themeColors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    content: { flex: 1, paddingHorizontal: spacing.gutter },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl },
    emptyIcon: { marginBottom: spacing.md, opacity: 0.5 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: themeColors.onSurface, marginBottom: spacing.sm },
    emptyText: { fontSize: 14, color: themeColors.neutral[500], textAlign: "center", marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
    sectionTitle: { fontSize: 18, fontWeight: "800", color: themeColors.onSurface, marginBottom: spacing.md, marginTop: spacing.lg },
    orderCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    activeCard: { borderColor: themeColors.primary[500], borderWidth: 2 },
    orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    orderId: { fontSize: 14, fontWeight: "700", color: themeColors.neutral[500] },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: "700" },
    orderItems: { marginBottom: spacing.sm },
    itemText: { fontSize: 14, color: themeColors.onSurface, marginBottom: 2 },
    orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: themeColors.surfaceVariant },
    orderDate: { fontSize: 12, color: themeColors.neutral[500] },
    orderTotal: { fontSize: 16, fontWeight: "800", color: themeColors.primary[500] },
    trackButton: { backgroundColor: themeColors.primary[500], paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: 12, marginTop: spacing.sm },
    trackButtonText: { color: themeColors.white, fontSize: 13, fontWeight: "700" },
  }), [themeColors]);

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const pastOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderOrder(order: typeof orders[0], isActive = false) {
    const status = STATUS_CONFIG[order.status];

    return (
      <View key={order.id} style={[styles.orderCard, isActive && styles.activeCard]}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Pedido #{order.id.slice(-4)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <MaterialCommunityIcons name={status.icon as any} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.title}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={[styles.itemText, { color: themeColors.neutral[500] }]}>
              +{order.items.length - 2} itens
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
        </View>

        {isActive && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => router.push({ pathname: "/(tabs)/rastreamento", params: { orderId: order.id } })}
          >
            <Text style={styles.trackButtonText}>Acompanhar</Text>
          </TouchableOpacity>
        )}
        {!isActive && order.status === "delivered" && (
          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: themeColors.secondary[500] }]}
            onPress={() => router.push({ pathname: "/avaliacao", params: { orderId: order.id } })}
          >
            <Text style={styles.trackButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Meus Pedidos" />
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={64}
            color={themeColors.neutral[300]}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
          <Text style={styles.emptyText}>
            Faça seu primeiro pedido e ele aparecerá aqui.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: themeColors.primary[500], paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: 16 }}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={{ color: themeColors.white, fontSize: 16, fontWeight: "700" }}>
              Explorar restaurantes
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meus Pedidos" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Em andamento</Text>
            {activeOrders.map((order) => renderOrder(order, true))}
          </>
        )}

        {pastOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Histórico</Text>
            {pastOrders.map((order) => renderOrder(order))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
