import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { Header } from "../../src/components/ui/Header";
import { spacing, formatPrice } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import { useDriverLocationPublisher } from "../../src/hooks/useDriverLocationPublisher";
import { startVoipCall } from "../../src/services/voip";
import { deliveryApi, orderApi } from "../../src/services/api";
import type { Order } from "../../src/types";

export default function DeliveryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ jobId?: string }>();
  const orderId = params.jobId ?? "";
  useDriverLocationPublisher(orderId || null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: spacing.md,
    },
    timeline: {
      gap: 0,
    },
    timelineItem: {
      flexDirection: "row",
      gap: spacing.md,
    },
    timelineLeft: {
      alignItems: "center",
      width: 24,
    },
    timelineDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.neutral[200],
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.neutral[300],
    },
    timelineDotCompleted: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    timelineDotActive: {
      backgroundColor: colors.white,
      borderColor: colors.primary[500],
      borderWidth: 3,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: colors.neutral[200],
      marginVertical: 4,
    },
    timelineLineCompleted: {
      backgroundColor: colors.primary[500],
    },
    timelineContent: {
      flex: 1,
      paddingBottom: spacing.lg,
    },
    timelineLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.neutral[500],
    },
    timelineLabelCompleted: {
      color: colors.onSurface,
    },
    timelineTime: {
      fontSize: 12,
      color: colors.neutral[500],
      marginTop: 2,
    },
    earningsCard: {
      backgroundColor: colors.primary[100],
      borderColor: colors.primary[100],
    },
    earningsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    earningsLabel: {
      fontSize: 13,
      color: colors.neutral[500],
      marginBottom: 4,
    },
    earningsValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary[500],
    },
    distanceBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.white,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    distanceText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.primary[500],
    },
    infoRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: 2,
    },
    infoText: {
      fontSize: 13,
      color: colors.neutral[500],
      lineHeight: 18,
    },
    notesBox: {
      flexDirection: "row",
      gap: spacing.sm,
      backgroundColor: colors.secondary[100],
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.md,
      alignItems: "flex-start",
    },
    notesText: {
      flex: 1,
      fontSize: 13,
      color: colors.neutral[700],
      lineHeight: 18,
    },
    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    contactText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary[500],
    },
    actionContainer: {
      paddingVertical: spacing.md,
      marginBottom: spacing.xl,
    },
  }), [colors]);

  const fetchOrder = React.useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const { data } = await deliveryApi.getDelivery(orderId).catch(() => orderApi.getById(orderId));
      setOrder((data.order ?? data) as Order);
    } catch (err) {
      console.error("[delivery-detail] load error", err);
      setError("Não foi possível carregar esta entrega. Verifique a ligação.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const statusOrder: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    delivering: 3,
    accepted: 1,
    picked_up: 2,
    in_transit: 3,
    delivered: 4,
  };
  const deliveryStatus = (order?.status ?? "pending") as string;
  const timeline = [
    { id: "accepted", label: "Pedido atribuído" },
    { id: "picked_up", label: "Retirado do restaurante" },
    { id: "in_transit", label: "A caminho do cliente" },
    { id: "delivered", label: "Entregue" },
  ];

  async function handleUpdateStatus() {
    if (!order || updating) return;
    const next =
      deliveryStatus === "accepted" || deliveryStatus === "pending" || deliveryStatus === "confirmed" || deliveryStatus === "preparing" || deliveryStatus === "ready"
        ? "picked_up"
        : deliveryStatus === "picked_up"
        ? "in_transit"
        : deliveryStatus === "in_transit" || deliveryStatus === "delivering"
        ? "delivered"
        : null;
    if (!next) return;
    try {
      setUpdating(true);
      setError(null);
      await deliveryApi.updateStatus(order.id, next);
      setOrder({ ...order, status: next as Order["status"] });
    } catch (err) {
      console.error("[delivery-detail] status error", err);
      setError("Não foi possível atualizar o estado. Tente novamente.");
    } finally {
      setUpdating(false);
    }
  }

  function handleCompleteDelivery() {
    router.back();
  }

  const isDelivered = deliveryStatus === "delivered";

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Detalhe da Entrega" showBack showCart={false} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
          <Text style={{ color: colors.neutral[500] }}>A carregar entrega…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !order) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Detalhe da Entrega" showBack showCart={false} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ color: colors.error, textAlign: "center" }}>{error}</Text>
          <Button title="Tentar novamente" onPress={fetchOrder} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Detalhe da Entrega" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {error ? (
          <View style={{ backgroundColor: colors.secondary[100], padding: spacing.md, borderRadius: 12, marginBottom: spacing.md }}>
            <Text style={{ color: colors.neutral[700] }}>{error}</Text>
          </View>
        ) : null}
        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status da Entrega</Text>
          <Text style={{ color: colors.neutral[500], marginBottom: spacing.md }}>
            Pedido #{order?.id.slice(-4) ?? "----"} · {order?.status ?? "pendente"}
          </Text>
          <View style={styles.timeline}>
            {timeline.map((status, index) => {
              const isActive = status.id === deliveryStatus;
              const isCompleted = (statusOrder[deliveryStatus] ?? -1) >= statusOrder[status.id];

              return (
                <View key={status.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotCompleted,
                        isActive && styles.timelineDotActive,
                      ]}
                    >
                      {isCompleted && (
                        <MaterialCommunityIcons name="check" size={12} color={colors.white} />
                      )}
                    </View>
                    {index < timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelCompleted,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Earnings Card */}
        <View style={[styles.card, styles.earningsCard]}>
          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>Total do pedido</Text>
              <Text style={styles.earningsValue}>{order ? formatPrice(order.total) : "—"}</Text>
            </View>
            {order?.deliveryFee != null ? (
              <View style={styles.distanceBadge}>
                <MaterialCommunityIcons name="moped" size={16} color={colors.primary[500]} />
                <Text style={styles.distanceText}>Taxa {formatPrice(order.deliveryFee)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Restaurante</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="store" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{order?.restaurant.name ?? "Restaurante"}</Text>
              <Text style={styles.infoText}>{order?.restaurant.description ?? order?.restaurant.cuisine ?? ""}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => order && startVoipCall(order.id)}
            >
              <MaterialCommunityIcons name="phone" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => order && router.push({ pathname: "/(delivery)/chat", params: { orderId: order.id } })}
            >
              <MaterialCommunityIcons name="chat" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="account" size={20} color={colors.primary[500]} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{order?.address.label ?? "Cliente"}</Text>
              <Text style={styles.infoText}>
                {[order?.address.address, order?.address.neighborhood, order?.address.city].filter(Boolean).join(" · ")}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => order && startVoipCall(order.id)}
            >
              <MaterialCommunityIcons name="phone" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => order && router.push({ pathname: "/(delivery)/chat", params: { orderId: order.id } })}
            >
              <MaterialCommunityIcons name="chat" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!isDelivered ? (
            <Button
              title={
                deliveryStatus === "accepted" || deliveryStatus === "pending"
                  ? "Confirmar recolha no restaurante"
                  : deliveryStatus === "picked_up"
                  ? "Iniciar entrega"
                  : "Confirmar entrega ao cliente"
              }
              onPress={handleUpdateStatus}
              loading={updating}
              disabled={updating || !order}
            />
          ) : (
            <Button
              title="Entrega concluída"
              onPress={handleCompleteDelivery}
              variant="secondary"
            />
          )}
          <Text style={{ fontSize: 12, color: colors.neutral[500], marginTop: spacing.sm, textAlign: "center" }}>
            Cada transição é validada no servidor e refletida para cliente e restaurante.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
