import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppSelector } from "../src/store";
import {
    selectActiveCoupons,
    selectActivePromotions,
} from "../src/store/promotionsSlice";
import { spacing } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

export default function PromotionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const promotions = useAppSelector(selectActivePromotions);
  const coupons = useAppSelector(selectActiveCoupons);

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
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    promoCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    promoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    promoBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colors.primary[100],
    },
    promoBadgeText: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary[500],
    },
    promoTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.xs,
    },
    promoDescription: {
      fontSize: 14,
      color: colors.neutral[500],
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    promoDiscount: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary[500],
    },
    promoExpiry: {
      fontSize: 12,
      color: colors.neutral[500],
      marginTop: spacing.sm,
    },
    couponCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 20,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: colors.primary[500],
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    couponCode: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.primary[500],
      letterSpacing: 1,
    },
    couponDescription: {
      fontSize: 13,
      color: colors.neutral[500],
      marginTop: 2,
    },
    couponContent: {
      flex: 1,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      marginTop: spacing.sm,
    },
  }), [colors]);

  function formatExpiry(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Promoções" showBack onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {promotions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ofertas especiais</Text>
            {promotions.map((promo) => (
              <TouchableOpacity
                key={promo.id}
                style={styles.promoCard}
                onPress={() => router.push("/restaurantes")}
                activeOpacity={0.8}
              >
                <View style={styles.promoHeader}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{promo.badge}</Text>
                  </View>
                </View>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDescription}>{promo.description}</Text>
                <Text style={styles.promoDiscount}>{promo.discount}</Text>
                <Text style={styles.promoExpiry}>
                  Válido até {formatExpiry(promo.expiresAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {coupons.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Cupons disponíveis</Text>
            {coupons.map((coupon) => (
              <View key={coupon.id} style={styles.couponCard}>
                <MaterialCommunityIcons name="ticket-percent" size={32} color={colors.primary[500]} />
                <View style={styles.couponContent}>
                  <Text style={styles.couponCode}>{coupon.code}</Text>
                  <Text style={styles.couponDescription}>{coupon.description}</Text>
                  {coupon.minOrderValue && (
                    <Text style={styles.couponDescription}>
                      Pedido mínimo: Kz {coupon.minOrderValue}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {promotions.length === 0 && coupons.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="tag-off" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhuma promoção ativa no momento</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
