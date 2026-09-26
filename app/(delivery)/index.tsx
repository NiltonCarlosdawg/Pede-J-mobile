import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { borderRadius, spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import {
    useGetAvailableDeliveriesQuery,
    useGetDeliveryHistoryQuery,
    useGetEarningsQuery,
} from "../../src/hooks/useApi";
import type { Order } from "../../src/types";

export default function DeliveryDashboard() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    isFetching: isFetchingAvailable,
    isError: isErrorAvailable,
    refetch: refetchAvailable,
  } = useGetAvailableDeliveriesQuery({ limit: 10 }, { refetchOnMountOrArgChange: true });
  const {
    data: earnings,
    isFetching: isFetchingEarnings,
    isError: isErrorEarnings,
    refetch: refetchEarnings,
  } = useGetEarningsQuery(undefined, { refetchOnMountOrArgChange: true });
  const {
    data: historyData,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useGetDeliveryHistoryQuery({ limit: 5 }, { refetchOnMountOrArgChange: true });

  const recentDeliveries = useMemo<Order[]>(() => {
    if (!historyData) return [];
    return Array.isArray(historyData) ? historyData : historyData.data ?? [];
  }, [historyData]);

  const loading = isFetchingAvailable || isFetchingEarnings || isFetchingHistory;
  const error = isErrorAvailable || isErrorEarnings
    ? "Erro ao carregar dados. Puxe para atualizar."
    : null;

  const fetchData = useCallback(() => {
    void refetchAvailable();
    void refetchEarnings();
    void refetchHistory();
  }, [refetchAvailable, refetchEarnings, refetchHistory]);

  const formatCurrency = useCallback((value: number) => {
    return `Kz ${value.toLocaleString("pt-AO")}`;
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.onSurface,
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
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
    kicker: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.primary[600],
      marginBottom: spacing.xs,
    },
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.neutral[700],
    },
    statsRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: borderRadius.xl,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    statValue: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: colors.neutral[700],
    },
    earningsCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 28,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    earningsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    earningMetric: {
      width: "48%",
      padding: spacing.md,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
    },
    earningValue: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.onSurface,
    },
    earningLabel: {
      marginTop: 4,
      fontSize: 13,
      color: colors.neutral[700],
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
    jobCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
    },
    jobIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    jobContent: {
      flex: 1,
    },
    jobTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    jobMeta: {
      fontSize: 13,
      color: colors.neutral[700],
      marginTop: 2,
    },
    acceptButton: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: colors.primary[500],
    },
    acceptText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "700",
    },
    historyCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainer,
      marginTop: spacing.sm,
    },
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
    },
    historyContent: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
    },
    historyMeta: {
      fontSize: 12,
      color: colors.neutral[700],
      marginTop: 2,
    },
    historyStatus: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary[500],
      marginTop: 4,
    },
    historyValueBlock: {
      alignItems: "flex-end",
    },
    historyValue: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.onSurface,
    },
    chatCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    chatItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant,
    },
    chatAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    chatContent: {
      flex: 1,
    },
    chatTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
    },
    chatText: {
      fontSize: 13,
      color: colors.neutral[500],
      marginTop: 2,
    },
    chatBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    chatBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.white,
    },
    actionButtonCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
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
    errorContainer: {
      alignItems: "center",
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    errorText: {
      fontSize: 14,
      color: colors.error,
      textAlign: "center",
    },
    retryButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.primary[500],
    },
    retryText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.white,
    },
  }), [colors]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PedeJá Entregador</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(delivery)/perfil")}
          >
            <MaterialCommunityIcons name="account" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PedeJá Entregador</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(delivery)/perfil")}
        >
          <MaterialCommunityIcons name="account" size={24} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Bem-vindo de volta</Text>
          <Text style={styles.title}>Dashboard de entregas</Text>
          <Text style={styles.subtitle}>
            Acompanhe seus ganhos e aceite novas entregas.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{earnings?.totalEntregas ?? 0}</Text>
            <Text style={styles.statLabel}>Entregas hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(earnings?.totalGanho ?? 0)}</Text>
            <Text style={styles.statLabel}>Ganhos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.earningsCard}
          onPress={() => router.push("/(delivery)/ganhos")}
          activeOpacity={0.8}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ganhos</Text>
            <Text style={styles.sectionAction}>Ver detalhes</Text>
          </View>

          <View style={styles.earningsGrid}>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{formatCurrency(earnings?.totalGanho ?? 0)}</Text>
              <Text style={styles.earningLabel}>Hoje</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{formatCurrency(earnings?.mediaPorEntrega ?? 0)}</Text>
              <Text style={styles.earningLabel}>Média</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{earnings?.totalEntregas ?? 0}</Text>
              <Text style={styles.earningLabel}>Entregas</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{formatCurrency(earnings?.mediaPorEntrega ?? 0)}</Text>
              <Text style={styles.earningLabel}>Por entrega</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Disponíveis agora</Text>
            <TouchableOpacity onPress={() => router.push("/(delivery)/historico")}>
              <Text style={styles.sectionAction}>Ver histórico</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : recentDeliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="motorbike" size={32} color={colors.neutral[300]} />
              <Text style={styles.emptyText}>Nenhuma entrega disponível no momento.</Text>
            </View>
          ) : (
            recentDeliveries.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.jobCard}
                onPress={() => router.push({ pathname: "/(delivery)/delivery-detail", params: { jobId: job.id } })}
              >
                <View style={styles.jobIcon}>
                  <MaterialCommunityIcons
                    name="moped"
                    size={22}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.jobContent}>
                  <Text style={styles.jobTitle}>{job.restaurant?.name ?? "Restaurante"}</Text>
                  <Text style={styles.jobMeta}>{job.address?.neighborhood ?? "Luanda"}</Text>
                  <Text style={styles.jobMeta}>
                    {formatCurrency(job.deliveryFee)}
                  </Text>
                </View>
                <View style={styles.acceptButton}>
                  <Text style={styles.acceptText}>Aceitar</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entregas recentes</Text>
            <TouchableOpacity onPress={() => router.push("/(delivery)/historico")}>
              <Text style={styles.sectionAction}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {recentDeliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma entrega recente.</Text>
            </View>
          ) : (
            recentDeliveries.map((delivery) => (
              <TouchableOpacity
                key={delivery.id}
                style={styles.historyCard}
                onPress={() => router.push({ pathname: "/(delivery)/delivery-detail", params: { jobId: delivery.id } })}
              >
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons
                    name={delivery.status === "delivered" ? "check-circle-outline" : "clock-outline"}
                    size={20}
                    color={delivery.status === "delivered" ? colors.primary[500] : colors.secondary[500]}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{delivery.restaurant?.name ?? "Restaurante"}</Text>
                  <Text style={styles.historyMeta}>
                    {delivery.address?.neighborhood ?? "Luanda"}
                  </Text>
                  <Text style={[styles.historyStatus, { color: delivery.status === "delivered" ? colors.primary[500] : colors.secondary[500] }]}>
                    {delivery.status === "delivered" ? "Concluída" : "Pendente"}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <TouchableOpacity
                    style={styles.actionButtonCircle}
                    onPress={() => router.push({ pathname: "/(delivery)/chat", params: { orderId: delivery.id } })}
                  >
                    <MaterialCommunityIcons name="chat" size={18} color={colors.white} />
                  </TouchableOpacity>
                  <View style={styles.historyValueBlock}>
                    <Text style={styles.historyValue}>{formatCurrency(delivery.deliveryFee)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
