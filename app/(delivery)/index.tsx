import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, borderRadius } from "../../src/theme";

const DELIVERY_JOBS = [
  {
    id: "1",
    restaurant: "Sabor da Praça",
    destination: "Mutamba, Luanda",
    fee: "Kz 1.400",
    distance: "2.1 km",
  },
  {
    id: "2",
    restaurant: "Pizza Hut Express",
    destination: "Maianga, Luanda",
    fee: "Kz 1.900",
    distance: "3.7 km",
  },
];

const EARNINGS = {
  today: "Kz 18.400",
  week: "Kz 92.900",
  month: "Kz 348.200",
  pending: "Kz 12.000",
};

const RECENT_DELIVERIES = [
  {
    id: "1",
    title: "Sabor da Praça",
    route: "Mutamba → Vila Alice",
    value: "Kz 1.400",
    status: "Concluída",
  },
  {
    id: "2",
    title: "Pizza Hut Express",
    route: "Maianga → Ingombota",
    value: "Kz 1.900",
    status: "Concluída",
  },
  {
    id: "3",
    title: "Burger Station",
    route: "Talatona → Alvalade",
    value: "Kz 2.100",
    status: "Pendente",
  },
];

export default function DeliveryDashboard() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Entregador demo</Text>
          <Text style={styles.title}>Dashboard de entregas</Text>
          <Text style={styles.subtitle}>
            Perfil de entregador ativo. Esta vista é separada da experiência do cliente.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Entregas hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Kz 18.400</Text>
            <Text style={styles.statLabel}>Ganhos</Text>
          </View>
        </View>

        <View style={styles.earningsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ganhos</Text>
            <Text style={styles.sectionAction}>Resumo demo</Text>
          </View>

          <View style={styles.earningsGrid}>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{EARNINGS.today}</Text>
              <Text style={styles.earningLabel}>Hoje</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{EARNINGS.week}</Text>
              <Text style={styles.earningLabel}>Semana</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{EARNINGS.month}</Text>
              <Text style={styles.earningLabel}>Mês</Text>
            </View>
            <View style={styles.earningMetric}>
              <Text style={styles.earningValue}>{EARNINGS.pending}</Text>
              <Text style={styles.earningLabel}>A receber</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Disponíveis agora</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {DELIVERY_JOBS.map((job) => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobIcon}>
                <MaterialCommunityIcons name="moped" size={22} color={colors.primary[500]} />
              </View>
              <View style={styles.jobContent}>
                <Text style={styles.jobTitle}>{job.restaurant}</Text>
                <Text style={styles.jobMeta}>{job.destination}</Text>
                <Text style={styles.jobMeta}>
                  {job.distance} · {job.fee}
                </Text>
              </View>
              <TouchableOpacity style={styles.acceptButton}>
                <Text style={styles.acceptText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entregas recentes</Text>
            <Text style={styles.sectionAction}>Últimas 24h</Text>
          </View>

          {RECENT_DELIVERIES.map((delivery) => (
            <View key={delivery.id} style={styles.historyCard}>
              <View style={styles.historyIcon}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color={colors.primary[500]}
                />
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>{delivery.title}</Text>
                <Text style={styles.historyMeta}>{delivery.route}</Text>
                <Text style={styles.historyStatus}>{delivery.status}</Text>
              </View>
              <View style={styles.historyValueBlock}>
                <Text style={styles.historyValue}>{delivery.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
