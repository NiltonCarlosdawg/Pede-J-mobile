import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { colors, spacing, borderRadius } from "../src/theme";

const ACTIVE_ORDER = {
  id: "#4092",
  title: "Burger Joint Master",
  status: "Em entrega",
  eta: "Chega em 15 min",
  address: "Rua das Flores, 123 - Centro",
};

const HISTORY = [
  {
    id: "1",
    title: "Smash Burger Duplo com Bacon",
    status: "Entregue ontem",
    total: "Kz 23.800",
    icon: "check-circle-outline",
  },
  {
    id: "2",
    title: "Pizza Quatro Queijos",
    status: "Entregue na semana passada",
    total: "Kz 18.500",
    icon: "check-circle-outline",
  },
  {
    id: "3",
    title: "Sushi Mix Especial",
    status: "Cancelado",
    total: "Kz 26.900",
    icon: "close-circle-outline",
  },
];

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Histórico de Pedidos" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.activeCard}>
          <View style={styles.activeTopRow}>
            <View style={styles.activeIcon}>
              <MaterialCommunityIcons
                name="moped"
                size={24}
                color={colors.primary[500]}
              />
            </View>
            <View style={styles.activeTextBlock}>
              <Text style={styles.activeKicker}>Pedido activo</Text>
              <Text style={styles.activeTitle}>{ACTIVE_ORDER.title}</Text>
              <Text style={styles.activeMeta}>
                {ACTIVE_ORDER.id} · {ACTIVE_ORDER.status}
              </Text>
            </View>
          </View>

          <View style={styles.activeDetails}>
            <Text style={styles.activeEta}>{ACTIVE_ORDER.eta}</Text>
            <Text style={styles.activeAddress}>{ACTIVE_ORDER.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.trackingButton}
            onPress={() => router.push("/rastreamento")}
          >
            <Text style={styles.trackingButtonText}>Ver acompanhamento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pedidos anteriores</Text>
          <Text style={styles.sectionMeta}>mock local</Text>
        </View>

        {HISTORY.map((order) => (
          <View key={order.id} style={styles.historyCard}>
            <View style={styles.historyIcon}>
              <MaterialCommunityIcons
                name={order.icon as never}
                size={22}
                color={order.icon.includes("close") ? colors.error : colors.primary[500]}
              />
            </View>

            <View style={styles.historyContent}>
              <Text style={styles.historyTitle}>{order.title}</Text>
              <Text style={styles.historyStatus}>{order.status}</Text>
            </View>

            <View style={styles.historyPriceBlock}>
              <Text style={styles.historyPrice}>{order.total}</Text>
              <TouchableOpacity onPress={() => router.push("/restaurante")}>
                <Text style={styles.repeatAction}>Repetir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.noteCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.neutral[500]}
          />
          <Text style={styles.noteText}>
            O histórico está em demo local por enquanto. O backend vai alimentar
            este ecrã depois.
          </Text>
        </View>
      </ScrollView>
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
  },
  activeCard: {
    backgroundColor: colors.primary[100],
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary[100],
    marginBottom: spacing.lg,
  },
  activeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  activeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  activeTextBlock: {
    flex: 1,
  },
  activeKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.primary[600],
  },
  activeTitle: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: colors.onSurface,
  },
  activeMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.neutral[700],
  },
  activeDetails: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  activeEta: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },
  activeAddress: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral[700],
  },
  trackingButton: {
    marginTop: spacing.md,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary[500],
    alignItems: "center",
  },
  trackingButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainer,
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
  historyStatus: {
    marginTop: 2,
    fontSize: 13,
    color: colors.neutral[700],
  },
  historyPriceBlock: {
    alignItems: "flex-end",
  },
  historyPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  repeatAction: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary[500],
  },
  noteCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral[700],
  },
});
