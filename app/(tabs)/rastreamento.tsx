import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Header } from "../../src/components/ui/Header";
import { TrackingMap } from "../../src/components/ui/TrackingMap";
import { useTheme } from "../../src/hooks/useTheme";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../src/store";
import { selectOrders, Order, OrderStatus } from "../../src/store/ordersSlice";
import { spacing, formatPrice } from "../../src/theme";
import { shadowStyle } from "../../src/utils/shadow";
import { MOCK_COORDINATES, simulateDriverMovement, calculateDistance, estimateDeliveryTime, type Coordinates } from "../../src/services/location";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: string; color: string }> = {
  preparing: { label: "Preparando", icon: "chef-hat", color: "#fbac1d" },
  ready: { label: "Pronto", icon: "package-variant", color: "#4CAF50" },
  delivering: { label: "Em entrega", icon: "truck-delivery", color: "#2196F3" },
  delivered: { label: "Entregue", icon: "check-circle", color: "#4CAF50" },
  cancelled: { label: "Cancelado", icon: "close-circle", color: "#BA1A1A" },
};

const TRACKING_STEPS = [
  { id: "1", title: "Pedido Confirmado", time: "19:45", completed: true },
  { id: "2", title: "Em preparo", time: "19:50", completed: true },
  { id: "3", title: "Em entrega", time: null, active: true, driver: "Carlos está a caminho" },
  { id: "4", title: "Entregue", time: null, completed: false },
];

const RESTAURANT_IMAGES: Record<string, string> = {
  "order-001": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
  "order-002": "https://images.unsplash.com/photo-1517248135467-4c7aad601933?w=200",
  "order-003": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200",
  "order-004": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200",
  "order-005": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
};

const RESTAURANT_NAMES: Record<string, string> = {
  "order-001": "Burger Joint Master",
  "order-002": "Sabor da Praça",
  "order-003": "Sushi Master",
  "order-004": "Chicken Station",
  "order-005": "Burger Joint Master",
};

function getStatusIndex(status: OrderStatus) {
  const map: Record<OrderStatus, number> = {
    preparing: 1,
    ready: 2,
    delivering: 3,
    delivered: 4,
    cancelled: 4,
  };
  return map[status] ?? 1;
}

export default function TrackingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const orders = useAppSelector(selectOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const pastOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");

  const selectedOrder = activeOrders.find((o) => o.id === selectedOrderId)
    ?? activeOrders[0]
    ?? null;

  // Coordenadas baseadas no pedido selecionado
  const restaurantLocation: Coordinates = selectedOrder?.address.neighborhood === "Ingombota"
    ? MOCK_COORDINATES.ingombota
    : selectedOrder?.address.neighborhood === "Talatona"
    ? MOCK_COORDINATES.talatona
    : MOCK_COORDINATES.mutamba;

  const customerLocation: Coordinates = selectedOrder?.address.label === "Trabalho"
    ? MOCK_COORDINATES.ingombota
    : MOCK_COORDINATES.maianga;

  const [driverLocation, setDriverLocation] = useState<Coordinates>(restaurantLocation);
  const [driverProgress, setDriverProgress] = useState(0);

  // Simula movimento do entregador
  useEffect(() => {
    if (!selectedOrder || selectedOrder.status !== "delivering") {
      setDriverLocation(restaurantLocation);
      setDriverProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        const next = prev + 0.02;
        if (next >= 1) {
          clearInterval(interval);
          return 1;
        }
        const newLocation = simulateDriverMovement(restaurantLocation, customerLocation, next);
        setDriverLocation(newLocation);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedOrder, restaurantLocation, customerLocation]);

  const distance = calculateDistance(driverLocation, customerLocation);
  const estimatedMinutes = estimateDeliveryTime(distance);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    mapContainer: {
      height: 300,
      position: "relative",
    },
    content: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 20,
      paddingBottom: 48,
      marginTop: -24,
      ...shadowStyle({ offsetY: -8, blur: 30, opacity: 0.1 }),
    },
    handle: {
      width: 48,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.neutral[300],
      alignSelf: "center",
      marginVertical: 16,
    },
    orderSelector: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
      flexWrap: "wrap",
    },
    orderChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    orderChipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    orderChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.onSurface,
    },
    orderChipTextActive: {
      color: colors.white,
    },
    statusSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    arrivalTime: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.onSurface,
    },
    arrivalRange: {
      fontSize: 14,
      color: colors.neutral[500],
      marginTop: 4,
    },
    restaurantCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
    },
    restaurantImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
    },
    restaurantInfo: {
      flex: 1,
    },
    restaurantName: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.onSurface,
    },
    orderNumber: {
      fontSize: 14,
      color: colors.neutral[500],
    },
    actionButtonsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    actionButtonCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
      ...shadowStyle({ color: colors.primary[500], offsetY: 2, blur: 4, opacity: 0.3, elevation: 4 }),
    },
    actionButtonText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary[500],
    },
    timeline: {
      position: "relative",
      paddingLeft: 24,
      marginBottom: 32,
    },
    timelineLine: {
      position: "absolute",
      left: 11,
      top: 24,
      bottom: 24,
      width: 2,
      backgroundColor: colors.surfaceVariant,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 24,
    },
    pendingStep: {
      opacity: 0.5,
    },
    stepIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.white,
      zIndex: 1,
    },
    completedIcon: {
      backgroundColor: colors.secondary[500],
    },
    activeIcon: {
      backgroundColor: colors.primary[500],
      ...shadowStyle({ color: colors.primary[500], offsetY: 0, blur: 8, opacity: 0.2, elevation: 4 }),
    },
    pendingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.white,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.onSurface,
    },
    activeStepTitle: {
      fontWeight: "700",
    },
    stepTime: {
      fontSize: 14,
      color: colors.neutral[500],
    },
    driverText: {
      fontSize: 14,
      color: colors.primary[500],
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
    historyCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 20,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    historyId: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.neutral[500],
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
    },
    historyItems: {
      marginBottom: spacing.sm,
    },
    itemText: {
      fontSize: 14,
      color: colors.onSurface,
      marginBottom: 2,
    },
    historyFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceVariant,
    },
    historyDate: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    historyTotal: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.primary[500],
    },
    emptyHistory: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      marginTop: spacing.sm,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary[500],
    },
  }), [colors]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderHistoryOrder(order: Order) {
    const status = STATUS_CONFIG[order.status];
    return (
      <View key={order.id} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyId}>Pedido #{order.id.slice(-4)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
            <MaterialCommunityIcons name={status.icon as any} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.historyItems}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.title}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={[styles.itemText, { color: colors.neutral[500] }]}>
              +{order.items.length - 2} itens
            </Text>
          )}
        </View>
        <View style={styles.historyFooter}>
          <Text style={styles.historyDate}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.historyTotal}>{formatPrice(order.total)}</Text>
        </View>
      </View>
    );
  }

  function renderTimeline() {
    const idx = selectedOrder ? getStatusIndex(selectedOrder.status) : 1;
    return (
      <View style={styles.timeline}>
        <View style={styles.timelineLine} />
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = index < idx;
          const isActive = index === idx;
          return (
            <View
              key={step.id}
              style={[styles.stepItem, !isCompleted && !isActive && styles.pendingStep]}
            >
              <View
                style={[
                  styles.stepIcon,
                  isCompleted && styles.completedIcon,
                  isActive && styles.activeIcon,
                ]}
              >
                {isCompleted ? (
                  <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                ) : isActive ? (
                  <MaterialCommunityIcons name="moped" size={14} color={colors.white} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>
                  {step.title}
                </Text>
                {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
                {isActive && step.driver && (
                  <Text style={styles.driverText}>{step.driver}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Acompanhamento" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Area - Real Map */}
        <View style={styles.mapContainer}>
          <TrackingMap
            restaurantLocation={restaurantLocation}
            customerLocation={customerLocation}
            driverLocation={driverLocation}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.handle} />

          {/* Order Selector */}
          {activeOrders.length > 1 && (
            <View style={styles.orderSelector}>
              {activeOrders.map((order) => {
                const isActive = selectedOrder?.id === order.id;
                const status = STATUS_CONFIG[order.status];
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderChip, isActive && styles.orderChipActive]}
                    onPress={() => setSelectedOrderId(order.id)}
                  >
                    <MaterialCommunityIcons
                      name={status.icon as any}
                      size={16}
                      color={isActive ? colors.white : status.color}
                    />
                    <Text style={[styles.orderChipText, isActive && styles.orderChipTextActive]}>
                      Pedido #{order.id.slice(-4)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {selectedOrder ? (
            <>
              <View style={styles.statusSection}>
                <Text style={styles.arrivalTime}>
                  {selectedOrder.status === "delivering"
                    ? `Chegando em ${estimatedMinutes} min`
                    : selectedOrder.status === "ready"
                    ? "Pronto para entrega"
                    : "Preparando seu pedido"}
                </Text>
                <Text style={styles.arrivalRange}>
                  {selectedOrder.status === "delivering"
                    ? `${distance.toFixed(1)} km restantes · `
                    : ""}
                  Pedido #{selectedOrder.id.slice(-4)} ·{" "}
                  {STATUS_CONFIG[selectedOrder.status].label}
                </Text>
              </View>

              <View style={styles.restaurantCard}>
                <Image
                  source={{
                    uri: RESTAURANT_IMAGES[selectedOrder.id] ??
                      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200",
                  }}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>
                    {RESTAURANT_NAMES[selectedOrder.id] ?? "Restaurante"}
                  </Text>
                  <Text style={styles.orderNumber}>
                    Pedido #{selectedOrder.id.slice(-4)}
                  </Text>
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({ pathname: "/chat", params: { orderId: selectedOrder.id } })}
                  >
                    <View style={styles.actionButtonCircle}>
                      <MaterialCommunityIcons name="chat" size={22} color={colors.white} />
                    </View>
                    <Text style={styles.actionButtonText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <View style={styles.actionButtonCircle}>
                      <MaterialCommunityIcons name="phone" size={22} color={colors.white} />
                    </View>
                    <Text style={styles.actionButtonText}>Ligar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedOrder.driver && (
                <View style={[styles.restaurantCard, { marginTop: -12, backgroundColor: colors.surfaceContainerLowest }]}>
                  <View style={[styles.actionButtonCircle, { backgroundColor: colors.primary[100], width: 44, height: 44, borderRadius: 14 }]}>
                    <MaterialCommunityIcons name="account" size={22} color={colors.primary[500]} />
                  </View>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{selectedOrder.driver.name}</Text>
                    <Text style={styles.orderNumber}>{selectedOrder.driver.vehicle ?? "Entregador"}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({ pathname: "/chat", params: { orderId: selectedOrder.id } })}
                  >
                    <View style={[styles.actionButtonCircle, { width: 40, height: 40, borderRadius: 20 }]}>
                      <MaterialCommunityIcons name="chat" size={18} color={colors.white} />
                    </View>
                    <Text style={styles.actionButtonText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              )}

              {renderTimeline()}
            </>
          ) : (
            <View style={[styles.emptyHistory, { marginVertical: spacing.lg }]}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>Nenhum pedido em andamento</Text>
              <TouchableOpacity
                style={[styles.viewAllButton, { marginTop: spacing.md }]}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.viewAllText}>Fazer um pedido</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Order History Section */}
          <Text style={styles.sectionTitle}>Pedidos anteriores</Text>
          {pastOrders.length > 0 ? (
            <>
              {pastOrders.slice(0, 3).map((order) => renderHistoryOrder(order))}
              {pastOrders.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push("/(tabs)/pedidos")}
                >
                  <Text style={styles.viewAllText}>Ver todos os pedidos</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyHistory}>
              <MaterialCommunityIcons name="receipt-text-outline" size={48} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>Nenhum pedido anterior</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
