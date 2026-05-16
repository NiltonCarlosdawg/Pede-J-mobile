import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FALLBACK_ADDRESSES } from "../src/constants/checkoutFallbacks";
import { useGetAddressesQuery } from "../src/hooks/useApi";
import { Header } from "../src/components/ui/Header";
import { spacing, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";
import type { Address } from "../src/types";

const ROW_HIT_SLOP = { top: 12, bottom: 12, left: 8, right: 8 };

export default function AddressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: apiAddresses, isFetching } = useGetAddressesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const addresses = useMemo((): Address[] => {
    if (apiAddresses && apiAddresses.length > 0) {
      return apiAddresses;
    }
    return FALLBACK_ADDRESSES;
  }, [apiAddresses]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          flex: 1,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.lg,
        },
        title: {
          ...typography.h2,
          color: colors.onBackground,
          marginBottom: spacing.lg,
        },
        loadingRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        loadingText: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        addressesList: {
          gap: spacing.md,
          paddingBottom: spacing.xxl,
        },
        addressCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 16,
          padding: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          minHeight: 52,
        },
        defaultAddress: {
          borderColor: colors.primary[500],
          borderWidth: 2,
        },
        addressIcon: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surfaceContainer,
          alignItems: "center",
          justifyContent: "center",
        },
        addressInfo: {
          flex: 1,
        },
        addressRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          marginBottom: 4,
        },
        addressLabel: {
          ...typography.labelLg,
          color: colors.onSurface,
        },
        defaultBadge: {
          backgroundColor: colors.primary[100],
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
        },
        defaultText: {
          ...typography.labelCaps,
          color: colors.primary[500],
        },
        addressText: {
          ...typography.bodySm,
          color: colors.onSurface,
        },
        neighborhoodText: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        addButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.primary[500],
          borderStyle: "dashed",
          marginTop: spacing.md,
          minHeight: 48,
        },
        addButtonText: {
          ...typography.labelLg,
          color: colors.primary[500],
        },
        offlineHint: {
          ...typography.bodySm,
          color: colors.neutral[600],
          marginBottom: spacing.md,
        },
      }),
    [colors]
  );

  function iconForLabel(label: string): "home" | "briefcase" | "map-marker" {
    if (label === "Casa") return "home";
    if (label === "Trabalho") return "briefcase";
    return "map-marker";
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header showBack />

      <View style={styles.content}>
        <Text style={styles.title}>Meus Endereços</Text>

        {isFetching ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary[500]} />
            <Text style={styles.loadingText}>A sincronizar endereços…</Text>
          </View>
        ) : null}

        {!apiAddresses?.length ? (
          <Text style={styles.offlineHint}>
            A mostrar endereços locais — liga-te ao servidor para atualizar automaticamente.
          </Text>
        ) : null}

        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.addressesList}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: addr }) => (
            <TouchableOpacity
              style={[styles.addressCard, addr.isDefault && styles.defaultAddress]}
              onPress={() => router.back()}
              activeOpacity={0.85}
              hitSlop={ROW_HIT_SLOP}
            >
              <View style={styles.addressIcon}>
                <MaterialCommunityIcons
                  name={iconForLabel(addr.label)}
                  size={24}
                  color={addr.isDefault ? colors.primary[500] : colors.neutral[500]}
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Principal</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                <Text style={styles.neighborhoodText}>
                  {addr.neighborhood}, {addr.city}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[300]} />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85} hitSlop={ROW_HIT_SLOP}>
              <MaterialCommunityIcons name="plus" size={20} color={colors.primary[500]} />
              <Text style={styles.addButtonText}>Adicionar novo endereço</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </SafeAreaView>
  );
}
