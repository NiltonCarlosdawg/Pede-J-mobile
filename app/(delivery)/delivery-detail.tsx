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
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const DELIVERY_STATUS = [
  { id: "accepted", label: "Pedido aceito", time: "14:30", completed: true },
  { id: "picked", label: "Retirado do restaurante", time: "14:45", completed: true },
  { id: "transit", label: "A caminho", time: "14:50", completed: true },
  { id: "delivered", label: "Entregue", time: "15:10", completed: false },
];

const RESTAURANT_INFO = {
  name: "Sabor da Praça",
  address: "Rua das Flores, 123 - Centro",
  phone: "+244 923 456 789",
};

const CUSTOMER_INFO = {
  name: "Alexandre João",
  address: "Rua da Mutamba, 45 - Apto 12",
  phone: "+244 923 123 456",
  notes: "Portão azul. Interfone 12.",
};

export default function DeliveryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ jobId?: string }>();
  const [currentStatus, setCurrentStatus] = useState("transit");
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

  function handleUpdateStatus() {
    const statusIndex = DELIVERY_STATUS.findIndex((s) => s.id === currentStatus);
    if (statusIndex < DELIVERY_STATUS.length - 1) {
      setCurrentStatus(DELIVERY_STATUS[statusIndex + 1].id);
    }
  }

  function handleCompleteDelivery() {
    router.back();
  }

  const isDelivered = currentStatus === "delivered";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Detalhe da Entrega" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status da Entrega</Text>
          <View style={styles.timeline}>
            {DELIVERY_STATUS.map((status, index) => {
              const isActive = status.id === currentStatus;
              const isCompleted = DELIVERY_STATUS.findIndex((s) => s.id === currentStatus) >= index;

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
                    {index < DELIVERY_STATUS.length - 1 && (
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
                    <Text style={styles.timelineTime}>{status.time}</Text>
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
              <Text style={styles.earningsLabel}>Valor da entrega</Text>
              <Text style={styles.earningsValue}>Kz 1.400</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color={colors.primary[500]} />
              <Text style={styles.distanceText}>2.1 km</Text>
            </View>
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
              <Text style={styles.infoTitle}>{RESTAURANT_INFO.name}</Text>
              <Text style={styles.infoText}>{RESTAURANT_INFO.address}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <TouchableOpacity style={styles.contactButton}>
              <MaterialCommunityIcons name="phone" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push({ pathname: "/(delivery)/chat", params: { orderId: "order-005" } })}
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
              <Text style={styles.infoTitle}>{CUSTOMER_INFO.name}</Text>
              <Text style={styles.infoText}>{CUSTOMER_INFO.address}</Text>
            </View>
          </View>
          {CUSTOMER_INFO.notes && (
            <View style={styles.notesBox}>
              <MaterialCommunityIcons name="information" size={16} color={colors.secondary[500]} />
              <Text style={styles.notesText}>{CUSTOMER_INFO.notes}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <TouchableOpacity style={styles.contactButton}>
              <MaterialCommunityIcons name="phone" size={16} color={colors.primary[500]} />
              <Text style={styles.contactText}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push({ pathname: "/(delivery)/chat", params: { orderId: "order-005" } })}
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
              title={currentStatus === "accepted" ? "Marcar como retirado" : "Marcar como entregue"}
              onPress={handleUpdateStatus}
            />
          ) : (
            <Button
              title="Entrega concluída"
              onPress={handleCompleteDelivery}
              variant="secondary"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
