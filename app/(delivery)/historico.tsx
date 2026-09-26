import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../src/components/ui/Header';
import { spacing, typography } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useGetDeliveryHistoryQuery } from '../../src/hooks/useApi';
import type { Order } from '../../src/types';

const FILTERS = ['Todas', 'Hoje', 'Semana', 'Mês'] as const;

const PERIOD_MAP: Record<string, { desde: string; ate: string }> = {
  Hoje: (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { desde: start.toISOString(), ate: now.toISOString() };
  })(),
  Semana: (() => {
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { desde: start.toISOString(), ate: now.toISOString() };
  })(),
  Mês: (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { desde: start.toISOString(), ate: now.toISOString() };
  })(),
};

export default function DeliveryHistoryScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [activeFilter, setActiveFilter] = useState('Todas');

  const params = useMemo<{ desde?: string; ate?: string; limit: number }>(() => {
    const base: { desde?: string; ate?: string; limit: number } = { limit: 50 };
    if (activeFilter !== 'Todas' && PERIOD_MAP[activeFilter]) {
      base.desde = PERIOD_MAP[activeFilter].desde;
      base.ate = PERIOD_MAP[activeFilter].ate;
    }
    return base;
  }, [activeFilter]);

  const { data, isFetching, isError, refetch } = useGetDeliveryHistoryQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const deliveries = useMemo<Order[]>(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : (data.data ?? []);
  }, [data]);

  const loading = isFetching;
  const error = isError ? 'Erro ao carregar histórico.' : null;

  const stats = useMemo(() => {
    const completed = deliveries.filter((d) => d.status === 'delivered');
    const totalEarnings = completed.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
    return {
      count: completed.length,
      earnings: totalEarnings,
      distance: '0.0',
      rating: '0',
    };
  }, [deliveries]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.background },
        content: { flex: 1, paddingHorizontal: spacing.lg },
        filterContainer: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.md,
          paddingTop: spacing.md,
        },
        filterButton: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: themeColors.surfaceContainer,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        filterButtonActive: {
          backgroundColor: themeColors.primary[500],
          borderColor: themeColors.primary[500],
        },
        filterText: { ...typography.bodySm, fontWeight: '600', color: themeColors.neutral[500] },
        filterTextActive: { color: themeColors.white },
        summaryCard: {
          backgroundColor: themeColors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        summaryRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: spacing.sm,
        },
        summaryItem: { alignItems: 'center' },
        summaryValue: { ...typography.h3, fontWeight: '800', color: themeColors.primary[500] },
        summaryLabel: { ...typography.bodySm, color: themeColors.neutral[500], marginTop: 2 },
        deliveryCard: {
          backgroundColor: themeColors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        deliveryHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
        },
        deliveryInfo: { flex: 1 },
        deliveryTitle: { ...typography.labelLg, color: themeColors.onSurface, marginBottom: 2 },
        deliveryMeta: { ...typography.bodySm, color: themeColors.neutral[500] },
        deliveryFee: { ...typography.labelLg, fontWeight: '800', color: themeColors.primary[500] },
        deliveryFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: themeColors.surfaceVariant,
        },
        deliveryDate: { ...typography.bodySm, color: themeColors.neutral[500] },
        statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8 },
        statusText: { ...typography.labelCaps, fontWeight: '700' },
        ratingContainer: { flexDirection: 'row', gap: 2 },
        emptyContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
        emptyText: { fontSize: 14, color: themeColors.neutral[500], textAlign: 'center' },
        errorContainer: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
        errorText: { fontSize: 14, color: themeColors.error, textAlign: 'center' },
        retryButton: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: themeColors.primary[500],
        },
        retryText: { fontSize: 14, fontWeight: '600', color: themeColors.white },
      }),
    [themeColors],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Histórico de Entregas" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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

        {loading ? (
          <View style={{ paddingVertical: spacing.xl }}>
            <ActivityIndicator size="large" color={themeColors.primary[500]} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={32}
              color={themeColors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : deliveries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={32} color={themeColors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhuma entrega encontrada para este período.</Text>
          </View>
        ) : (
          deliveries.map((delivery) => (
            <View key={delivery.id} style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTitle}>
                    {delivery.restaurant?.name ?? 'Restaurante'}
                  </Text>
                  <Text style={styles.deliveryMeta}>
                    {delivery.address?.neighborhood ?? 'Luanda'}
                  </Text>
                </View>
                <Text style={styles.deliveryFee}>
                  Kz {(delivery.deliveryFee || 0).toLocaleString()}
                </Text>
              </View>

              <View style={styles.deliveryFooter}>
                <Text style={styles.deliveryDate}>{formatDate(delivery.createdAt)}</Text>
                <View style={styles.ratingContainer}>
                  {delivery.status === 'delivered' &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < 5 ? 'star' : 'star-outline'}
                        size={14}
                        color={i < 5 ? '#fbac1d' : themeColors.neutral[300]}
                      />
                    ))}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        delivery.status === 'delivered'
                          ? themeColors.primary[100]
                          : themeColors.error + '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          delivery.status === 'delivered'
                            ? themeColors.primary[500]
                            : themeColors.error,
                      },
                    ]}
                  >
                    {delivery.status === 'delivered' ? 'Concluída' : 'Cancelada'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
