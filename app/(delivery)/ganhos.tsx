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

const PERIODS = ["Hoje", "Semana", "Mês", "Ano"];

const EARNINGS_DATA = {
  Hoje: {
    total: 18400,
    deliveries: 12,
    distance: 28.5,
    time: "6h 30m",
    hourly: 2831,
    chart: [1200, 1800, 900, 2200, 1500, 2800, 3100, 1900, 2400, 1600, 2100, 1400],
  },
  Semana: {
    total: 92900,
    deliveries: 58,
    distance: 142.3,
    time: "32h 15m",
    hourly: 2882,
    chart: [12000, 15400, 9800, 18700, 14200, 16800, 16000],
  },
  Mês: {
    total: 348200,
    deliveries: 218,
    distance: 534.8,
    time: "128h 45m",
    hourly: 2704,
    chart: [45000, 52000, 48000, 61000, 55000, 42000, 49000, 56000],
  },
  Ano: {
    total: 4185600,
    deliveries: 2616,
    distance: 6417.6,
    time: "1545h 00m",
    hourly: 2709,
    chart: [320000, 350000, 380000, 340000, 360000, 390000, 410000, 370000, 350000, 380000, 420000, 440000],
  },
};

const RECENT_PAYOUTS = [
  { id: "1", date: "10 Mai 2026", amount: 18400, status: "completed" },
  { id: "2", date: "09 Mai 2026", amount: 15600, status: "completed" },
  { id: "3", date: "08 Mai 2026", amount: 21300, status: "completed" },
  { id: "4", date: "07 Mai 2026", amount: 18900, status: "completed" },
];

export default function EarningsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [activePeriod, setActivePeriod] = useState("Hoje");

  const data = EARNINGS_DATA[activePeriod as keyof typeof EARNINGS_DATA];
  const maxValue = Math.max(...data.chart);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg },
    periodContainer: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, paddingTop: spacing.md },
    periodButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12, backgroundColor: themeColors.surfaceContainer, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    periodButtonActive: { backgroundColor: themeColors.primary[500], borderColor: themeColors.primary[500] },
    periodText: { fontSize: 14, fontWeight: "600", color: themeColors.neutral[500] },
    periodTextActive: { color: themeColors.white },
    totalCard: { backgroundColor: themeColors.primary[500], borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md },
    totalLabel: { fontSize: 14, color: themeColors.white, opacity: 0.8, marginBottom: 4 },
    totalValue: { fontSize: 36, fontWeight: "800", color: themeColors.white, marginBottom: spacing.md },
    totalRow: { flexDirection: "row", justifyContent: "space-between" },
    totalItem: { alignItems: "center" },
    totalItemValue: { fontSize: 16, fontWeight: "700", color: themeColors.white },
    totalItemLabel: { fontSize: 12, color: themeColors.white, opacity: 0.7, marginTop: 2 },
    chartCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    chartTitle: { fontSize: 16, fontWeight: "700", color: themeColors.onSurface, marginBottom: spacing.md },
    chartContainer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 120, gap: 4 },
    chartBar: { width: "7%", backgroundColor: themeColors.primary[500], borderRadius: 4, opacity: 0.8 },
    chartBarActive: { opacity: 1 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
    statCard: { width: "48%", backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    statIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: themeColors.primary[100], alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
    statValue: { fontSize: 18, fontWeight: "800", color: themeColors.onSurface, marginBottom: 2 },
    statLabel: { fontSize: 12, color: themeColors.neutral[500] },
    payoutCard: { backgroundColor: themeColors.surfaceContainerLowest, borderRadius: 24, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: themeColors.surfaceVariant },
    payoutTitle: { fontSize: 16, fontWeight: "700", color: themeColors.onSurface, marginBottom: spacing.md },
    payoutItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: themeColors.surfaceVariant },
    payoutDate: { fontSize: 14, color: themeColors.neutral[500] },
    payoutAmount: { fontSize: 15, fontWeight: "700", color: themeColors.onSurface },
    payoutStatus: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8, backgroundColor: themeColors.primary[100] },
    payoutStatusText: { fontSize: 11, fontWeight: "700", color: themeColors.primary[500] },
  }), [themeColors]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Meus Ganhos" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, activePeriod === period && styles.periodButtonActive]}
              onPress={() => setActivePeriod(period)}
            >
              <Text style={[styles.periodText, activePeriod === period && styles.periodTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Earnings */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total em {activePeriod.toLowerCase()}</Text>
          <Text style={styles.totalValue}>Kz {data.total.toLocaleString()}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalItemValue}>{data.deliveries}</Text>
              <Text style={styles.totalItemLabel}>Entregas</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={styles.totalItemValue}>{data.distance} km</Text>
              <Text style={styles.totalItemLabel}>Distância</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={styles.totalItemValue}>{data.time}</Text>
              <Text style={styles.totalItemLabel}>Online</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Desempenho</Text>
          <View style={styles.chartContainer}>
            {data.chart.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  index === data.chart.length - 1 && styles.chartBarActive,
                  { height: `${(value / maxValue) * 100}%` },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.statValue}>Kz {data.hourly.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Por hora</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="motorbike" size={20} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.statValue}>Kz {Math.round(data.total / data.deliveries).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Por entrega</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="map-marker-distance" size={20} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.statValue}>{(data.distance / data.deliveries).toFixed(1)} km</Text>
            <Text style={styles.statLabel}>Média dist.</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons name="star" size={20} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
        </View>

        {/* Recent Payouts */}
        <View style={styles.payoutCard}>
          <Text style={styles.payoutTitle}>Pagamentos recentes</Text>
          {RECENT_PAYOUTS.map((payout) => (
            <View key={payout.id} style={styles.payoutItem}>
              <Text style={styles.payoutDate}>{payout.date}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={styles.payoutAmount}>Kz {payout.amount.toLocaleString()}</Text>
                <View style={styles.payoutStatus}>
                  <Text style={styles.payoutStatusText}>Pago</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
