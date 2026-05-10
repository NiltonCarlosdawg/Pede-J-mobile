import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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

const FILTERS = ["Todas", "Hoje", "Semana", "Mês"];

const DELIVERIES = [
  {
    id: "1",
    restaurant: "Sabor da Praça",
    destination: "Mutamba, Luanda",
    fee: 1400,
    distance: "2.1 km",
    date: "2026-05-10T14:30:00",
    status: "completed",
    rating: 5,
  },
  {
    id: "2",
    restaurant: "Pizza Hut Express",
    destination: "Maianga, Luanda",
    fee: 1900,
    distance: "3.7 km",
    date: "2026-05-10T11:15:00",
    status: "completed",
    rating: 4,
  },
  {
    id: "3",
    restaurant: "Burger Station",
    destination: "Talatona, Luanda",
    fee: 2100,
    distance: "5.2 km",
    date: "2026-05-09T16:45:00",
    status: "completed",
    rating: 5,
  },
  {
    id: "4",
    restaurant: "Sushi Master",
    destination: "Ingombota, Luanda",
    fee: 1600,
    distance: "2.8 km",
    date: "2026-05-09T12:20:00",
    status: "cancelled",
    rating: null,
  },
  {
    id: "5",
    restaurant: "BBQ Master Prime",
    destination: "Vila Alice, Luanda",
    fee: 1800,
    distance: "3.1 km",
    date: "2026-05-08T19:00:00",
    status: "completed",
    rating: 5,
  },
];

export default function DeliveryHistoryScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [activeFilter, setActiveFilter] = useState("Todas");

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    filterContainer: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, paddingTop: spacing.md },
    filterButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, backgroundColor: themeColors.surfaceContainer, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    filterButtonActive: { backgroundColor: themeColors.primary[500], borderColor: themeColors.primary[500] },
    filterText: { fontSize: 14, fontWeight: "600", color: themeColors.neutral[500] },
    filterTextActive: { color: themeColors.white },
    summaryCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
    summaryItem: { alignItems: "center" },
    summaryValue: { fontSize: 20, fontWeight: "800", color: themeColors.primary[500] },
    summaryLabel: { fontSize: 12, color: themeColors.neutral[500], marginTop: 2 },
    deliveryCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    deliveryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm },
    deliveryInfo: { flex: 1 },
    deliveryTitle: { fontSize: 15, fontWeight: "700", color: themeColors.onSurface, marginBottom: 2 },
    deliveryMeta: { fontSize: 13, color: themeColors.neutral[500] },
    deliveryFee: { fontSize: 16, fontWeight: "800", color: themeColors.primary[500] },
    deliveryFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: themeColors.surfaceVariant },
    deliveryDate: { fontSize: 12, color: themeColors.neutral[500] },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: "700" },
    ratingContainer: { flexDirection: "row", gap: 2 },
  }), [themeColors]);

  const filteredDeliveries = useMemo(() => {
    if (activeFilter === "Todas") return DELIVERIES;
    const now = new Date();
    return DELIVERIES.filter((d) => {
      const date = new Date(d.date);
      if (activeFilter === "Hoje") {
        return date.toDateString() === now.toDateString();
      }
      if (activeFilter === "Semana") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      if (activeFilter === "Mês") {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [activeFilter]);

  const stats = useMemo(() => {
    const completed = filteredDeliveries.filter((d) => d.status === "completed");
    const totalEarnings = completed.reduce((sum, d) => sum + d.fee, 0);
    const totalDistance = completed.reduce((sum, d) => sum + parseFloat(d.distance), 0);
    return {
      count: completed.length,
      earnings: totalEarnings,
      distance: totalDistance.toFixed(1),
      rating: completed.length > 0 ? (completed.reduce((sum, d) => sum + (d.rating || 0), 0) / completed.length).toFixed(1) : "0",
    };
  }, [filteredDeliveries]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Histórico de Entregas" showBack />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Filters */}
        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.count}</Text>
              <Text style={styles.summaryLabel}>Entregas</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>Kz {stats.earnings.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Ganhos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.distance} km</Text>
              <Text style={styles.summaryLabel}>Distância</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.rating}</Text>
              <Text style={styles.summaryLabel}>Avaliação</Text>
            </View>
          </View>
        </View>

        {/* Deliveries List */}
        {filteredDeliveries.map((delivery) => (
          <View key={delivery.id} style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>{delivery.restaurant}</Text>
                <Text style={styles.deliveryMeta}>
                  {delivery.destination} · {delivery.distance}
                </Text>
              </View>
              <Text style={styles.deliveryFee}>Kz {delivery.fee.toLocaleString()}</Text>
            </View>

            <View style={styles.deliveryFooter}>
              <Text style={styles.deliveryDate}>{formatDate(delivery.date)}</Text>
              <View style={styles.ratingContainer}>
                {delivery.rating &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name={i < delivery.rating! ? "star" : "star-outline"}
                      size={14}
                      color={i < delivery.rating! ? "#fbac1d" : themeColors.neutral[300]}
                    />
                  ))}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: delivery.status === "completed" ? themeColors.primary[100] : themeColors.error + "15" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: delivery.status === "completed" ? themeColors.primary[500] : themeColors.error },
                  ]}
                >
                  {delivery.status === "completed" ? "Concluída" : "Cancelada"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
