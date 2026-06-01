import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { spacing, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
  selectPaymentMethods,
  setDefaultPaymentMethod,
} from "../src/store/paymentMethodsSlice";
import type { PaymentMethod, PaymentMethodType } from "../src/types";

const METHOD_ICONS: Record<PaymentMethodType, string> = {
  paypay: "wallet",
  multicaixa_express: "bank-transfer",
  unitel_money: "cellphone",
  facipay: "credit-card-wireless",
};

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  paypay: "PayPay",
  multicaixa_express: "Multicaixa Express",
  unitel_money: "Unitel Money",
  facipay: "FaciPay",
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const methods = useAppSelector(selectPaymentMethods);
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.gutter },
    header: { paddingVertical: spacing.md },
    headerTitle: { ...typography.h2, color: colors.onSurface },
    headerSubtitle: { ...typography.bodySm, color: colors.neutral[500], marginTop: 4 },
    card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.surfaceVariant },
    cardSelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
    cardLabel: { ...typography.labelLg, color: colors.onSurface },
    cardNumber: { ...typography.bodySm, color: colors.neutral[500] },
    cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    listContent: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl },
    emptyText: { ...typography.h3, color: colors.onSurface, marginTop: spacing.md },
    emptySubtext: { ...typography.bodySm, color: colors.neutral[500], marginTop: spacing.xs },
    methodItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.surfaceVariant,
      backgroundColor: colors.surfaceContainerLowest,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    methodItemSelected: {
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[50],
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainerSelected: {
      backgroundColor: colors.primary[500],
    },
    methodDetails: {
      flex: 1,
    },
    methodName: {
      ...typography.labelLg,
      color: colors.onSurface,
      fontWeight: "700",
    },
    methodDescription: {
      ...typography.bodySm,
      color: colors.neutral[500],
      marginTop: 2,
    },
    defaultBadge: {
      backgroundColor: colors.primary[100],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: 8,
      marginRight: spacing.sm,
    },
    defaultText: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary[600],
      textTransform: "uppercase",
    },
    checkmark: {
      marginLeft: spacing.sm,
    },
    infoCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: spacing.md,
      marginHorizontal: spacing.gutter,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    infoText: {
      ...typography.bodySm,
      color: colors.neutral[500],
      flex: 1,
      lineHeight: 18,
    },
  }), [colors]);

  const handleSelectMethod = (id: string) => {
    dispatch(setDefaultPaymentMethod(id));
  };

  const renderMethod = ({ item }: { item: PaymentMethod }) => {
    const isSelected = item.isDefault;
    const icon = METHOD_ICONS[item.type] as any;
    const label = METHOD_LABELS[item.type] || item.label;

    return (
      <TouchableOpacity
        style={[
          styles.methodItem,
          isSelected && styles.methodItemSelected,
        ]}
        onPress={() => handleSelectMethod(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isSelected ? colors.white : colors.primary[500]}
          />
        </View>

        <View style={styles.methodDetails}>
          <Text style={styles.methodName}>{label}</Text>
          <Text style={styles.methodDescription}>Pagamento digital</Text>
        </View>

        {isSelected && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Padrão</Text>
          </View>
        )}

        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={colors.primary[500]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Header
          title="Métodos de Pagamento"
          showBack
          onBackPress={() => router.back()}
        />

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={20} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            Escolha sua carteira digital preferida. Todas as opções são seguras e disponíveis em Angola.
          </Text>
        </View>

        <FlatList
          data={methods}
          renderItem={renderMethod}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
