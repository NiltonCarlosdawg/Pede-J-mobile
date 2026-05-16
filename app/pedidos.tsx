import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppSelector } from "../src/store";
import { selectOrders, selectCurrentOrder } from "../src/store/ordersSlice";
import type { Order } from "../src/store/ordersSlice";
import { spacing, formatPrice, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

const STATUS_CONFIG = {
  preparing: { label: "Preparando", icon: "chef-hat", color: "#fbac1d" },
  ready: { label: "Pronto", icon: "package-variant", color: "#4CAF50" },
  delivering: { label: "Em entrega", icon: "truck-delivery", color: "#2196F3" },
  delivered: { label: "Entregue", icon: "check-circle", color: "#4CAF50" },
  cancelled: { label: "Cancelado", icon: "close-circle", color: "#BA1A1A" },
};

const ROW_HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const PAGE_SIZE = 10;

export default function OrdersScreen() {
  const router = useRouter();
  const allOrders = useAppSelector(selectOrders);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const { colors: themeColors } = useTheme();
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    content: { flex: 1, paddingHorizontal: spacing.gutter },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl },
    emptyIcon: { marginBottom: spacing.md, opacity: 0.5 },
    emptyTitle: { ...typography.h3, color: themeColors.onSurface, marginBottom: spacing.sm },
    emptyText: { ...typography.bodySm, color: themeColors.neutral[500], textAlign: "center", marginBottom: spacing.lg, paddingHorizontal: spacing.xl },
    sectionTitle: { ...typography.h3, color: themeColors.onSurface, marginBottom: spacing.md, marginTop: spacing.lg },
    orderCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    activeCard: { borderColor: themeColors.primary[500], borderWidth: 2 },
    orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    orderId: { ...typography.bodySm, fontWeight: "700", color: themeColors.neutral[500] },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
    statusText: { ...typography.labelCaps, fontWeight: "700" },
    orderItems: { marginBottom: spacing.sm },
    itemText: { ...typography.bodySm, color: themeColors.onSurface, marginBottom: 2 },
    orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: themeColors.surfaceVariant },
    orderDate: { ...typography.bodySm, color: themeColors.neutral[500] },
    orderTotal: { ...typography.labelLg, fontWeight: "800", color: themeColors.primary[500] },
    trackButton: { backgroundColor: themeColors.primary[500], paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: 12, marginTop: spacing.sm },
    trackButtonText: { color: themeColors.white, ...typography.labelCaps, fontWeight: "700" },
    listContent: { paddingBottom: spacing.xl },
  }), [themeColors]);

  const activeOrders: Order[] = useMemo(
    () => allOrders.filter((o) => o.status !== "delivered" && o.status !== "cancelled"),
    [allOrders]
  );
  const pastOrders: Order[] = useMemo(
    () => allOrders.filter((o) => o.status === "delivered" || o.status === "cancelled"),
    [allOrders]
  );

  const sections = useMemo(() => {
    const result: Array<{ title: string; data: Order[]; isActive: boolean }> = [];
    if (activeOrders.length > 0) result.push({ title: "Em andamento", data: activeOrders, isActive: true });
    if (pastOrders.length > 0) result.push({ title: "Histórico", data: pastOrders, isActive: false });
    return result;
  }, [activeOrders, pastOrders]);

  const flatData = useMemo(() => {
    const items: Array<{ type: "header" | "order"; title?: string; order?: Order; isActive?: boolean }> = [];
    for (const section of sections) {
      items.push({ type: "header", title: section.title });
      for (const order of section.data.slice(0, page * PAGE_SIZE)) {
        items.push({ type: "order", order, isActive: section.isActive });
      }
    }
    return items;
  }, [sections, page]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const renderItem = useCallback(({ item }: { item: typeof flatData[0] }) => {
    if (item.type === "header") {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    const order = item.order!;
    const isActive = item.isActive!;
    const status = STATUS_CONFIG[order.status];

    return (
      <View style={[styles.orderCard, isActive && styles.activeCard]}>
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
            hitSlop={ROW_HIT_SLOP}
            onPress={() => router.push({ pathname: "/(tabs)/rastreamento", params: { orderId: order.id } })}
          >
            <Text style={styles.trackButtonText}>Acompanhar</Text>
          </TouchableOpacity>
        )}
        {!isActive && order.status === "delivered" && (
          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: themeColors.secondary[500] }]}
            hitSlop={ROW_HIT_SLOP}
            onPress={() => router.push({ pathname: "/avaliacao", params: { orderId: order.id } })}
          >
            <Text style={styles.trackButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [styles, themeColors, router]);

  const keyExtractor = useCallback((item: typeof flatData[0], index: number) =>
    item.type === "header" ? `header-${item.title}` : item.order!.id,
  []);

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return;
    const totalVisible = flatData.filter((d) => d.type === "order").length;
    if (totalVisible >= allOrders.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, flatData, allOrders.length]);

  if (allOrders.length === 0) {
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
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.content, styles.listContent]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: spacing.md, alignItems: "center" }}>
              <ActivityIndicator size="small" color={themeColors.primary[500]} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
