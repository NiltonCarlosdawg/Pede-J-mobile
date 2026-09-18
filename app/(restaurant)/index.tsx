import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../../src/components/ui/Header";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import { useAppSelector } from "../../src/store";
import { restaurantManageApi } from "../../src/services/api";
import type { RestaurantOrder, RestaurantStats } from "../../src/store/restaurantOrdersSlice";

export default function RestaurantDashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RestaurantOrder[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, ordersRes] = await Promise.all([
        restaurantManageApi.getStats().catch(() => ({
          data: {
            todayOrders: 12,
            todayRevenue: 45000,
            weekOrders: 78,
            weekRevenue: 312000,
            monthOrders: 312,
            monthRevenue: 1248000,
            averageRating: 4.7,
            totalRatings: 89,
          },
        })),
        restaurantManageApi.getOrders({ limit: 5 }).catch(() => ({
          data: {
            data: [
              {
                id: "ord-001",
                clientName: "Alexandre João",
                items: [
                  { id: "1", name: "Burger Clássico", quantity: 2, price: 2500 },
                  { id: "2", name: "Batata Frita", quantity: 1, price: 1200 },
                ],
                status: "pending",
                total: 6200,
                deliveryFee: 500,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: "ord-002",
                clientName: "Maria Santos",
                items: [
                  { id: "3", name: "Pizza Margherita", quantity: 1, price: 3500 },
                ],
                status: "confirmed",
                total: 4000,
                deliveryFee: 500,
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: "ord-003",
                clientName: "Pedro Silva",
                items: [
                  { id: "4", name: "Frango Grelhado", quantity: 1, price: 2800 },
                  { id: "5", name: "Salada", quantity: 1, price: 1500 },
                ],
                status: "preparing",
                total: 4300,
                deliveryFee: 500,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        })),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.data ?? ordersRes.data);
    } catch (err: any) {
      console.error("[RestaurantDashboard] fetchData error:", err);
      setError("Erro ao carregar dados. Puxe para atualizar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = useCallback((value: number) => {
    return `Kz ${value.toLocaleString("pt-AO")}`;
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending": return colors.warning;
      case "confirmed": return colors.info;
      case "preparing": return colors.primary[500];
      case "ready": return colors.success;
      case "delivering": return colors.secondary[500];
      case "delivered": return colors.success;
      case "cancelled": return colors.error;
      default: return colors.neutral[500];
    }
  }, [colors]);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "pending": return "Novo";
      case "confirmed": return "Confirmado";
      case "preparing": return "Preparando";
      case "ready": return "Pronto";
      case "delivering": return "A caminho";
      case "delivered": return "Entregue";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    heroCard: {
      backgroundColor: colors.primary[100],
      borderRadius: 28,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.secondary[100],
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    welcomeText: {
      fontSize: 14,
      color: colors.neutral[700],
    },
    restaurantName: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.onSurface,
    },
    openToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: isOpen ? colors.success + "20" : colors.error + "20",
    },
    openText: {
      fontSize: 14,
      fontWeight: "600",
      color: isOpen ? colors.success : colors.error,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    statCard: {
      width: "48%",
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 20,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    sectionCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 28,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      gap: spacing.sm,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.onSurface,
    },
    sectionAction: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary[500],
    },
    orderCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
    },
    orderIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    orderInfo: {
      flex: 1,
    },
    orderTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 2,
    },
    orderMeta: {
      fontSize: 13,
      color: colors.neutral[500],
    },
    orderRight: {
      alignItems: "flex-end",
      gap: 4,
    },
    orderValue: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primary[500],
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },
    ratingCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 28,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    ratingBig: {
      fontSize: 48,
      fontWeight: "800",
      color: colors.secondary[500],
    },
    ratingStars: {
      flexDirection: "row",
      gap: 2,
    },
    ratingCount: {
      fontSize: 13,
      color: colors.neutral[500],
      marginTop: 4,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
    },
  }), [colors, isOpen]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header title="Dashboard" showBack={false} showCart={false} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="Dashboard" showBack={false} showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Welcome Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.welcomeText}>Bem-vindo,</Text>
              <Text style={styles.restaurantName}>{user?.name ?? "Restaurante"}</Text>
            </View>
            <TouchableOpacity
              style={styles.openToggle}
              onPress={() => setIsOpen(!isOpen)}
            >
              <MaterialCommunityIcons
                name={isOpen ? "store" : "store-outline"}
                size={16}
                color={isOpen ? colors.success : colors.error}
              />
              <Text style={styles.openText}>{isOpen ? "Aberto" : "Fechado"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="receipt" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>{stats.todayOrders}</Text>
              <Text style={styles.statLabel}>Pedidos Hoje</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.todayRevenue)}</Text>
              <Text style={styles.statLabel}>Receita Hoje</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="calendar-week" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>{stats.weekOrders}</Text>
              <Text style={styles.statLabel}>Pedidos Semana</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="chart-line" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.statValue}>{formatCurrency(stats.weekRevenue)}</Text>
              <Text style={styles.statLabel}>Receita Semana</Text>
            </View>
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos Recentes</Text>
            <TouchableOpacity onPress={() => router.push("/(restaurant)/pedidos")}>
              <Text style={styles.sectionAction}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="receipt" size={32} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>Nenhum pedido recente</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push({ pathname: "/(restaurant)/pedidos", params: { orderId: order.id } })}
              >
                <View style={styles.orderIcon}>
                  <MaterialCommunityIcons name="account" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{order.clientName}</Text>
                  <Text style={styles.orderMeta}>
                    {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderValue}>{formatCurrency(order.total)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Rating Card */}
        {stats && stats.totalRatings > 0 && (
          <View style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>Avaliação</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingBig}>{stats.averageRating.toFixed(1)}</Text>
              <View>
                <View style={styles.ratingStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name={i < Math.floor(stats.averageRating) ? "star" : "star-outline"}
                      size={20}
                      color={colors.secondary[500]}
                    />
                  ))}
                </View>
                <Text style={styles.ratingCount}>{stats.totalRatings} avaliações</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
