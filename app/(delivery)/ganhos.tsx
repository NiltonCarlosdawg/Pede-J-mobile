import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useGetEarningsQuery } from '../../src/hooks/useApi';

type PeriodKey = 'Hoje' | 'Semana' | 'Mês' | 'Ano';
const PERIODS: PeriodKey[] = ['Hoje', 'Semana', 'Mês', 'Ano'];

const PERIOD_PARAM_MAP: Record<PeriodKey, string> = {
  Hoje: 'hoje',
  Semana: 'semana',
  Mês: 'mes',
  Ano: 'ano',
};

export default function EarningsScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('Hoje');

  const {
    data: earnings,
    isFetching,
    isError,
    refetch,
  } = useGetEarningsQuery(
    { periodo: PERIOD_PARAM_MAP[activePeriod] },
    { refetchOnMountOrArgChange: true },
  );

  const loading = isFetching;
  const error = isError ? 'Erro ao carregar ganhos.' : null;

  const chartData = useMemo(() => {
    return earnings?.detalhe?.map((d) => d.ganho) ?? [];
  }, [earnings]);

  const maxValue = useMemo(() => {
    return Math.max(...(chartData.length > 0 ? chartData : [1]));
  }, [chartData]);

  const totalHours = useMemo(() => {
    return earnings?.totalEntregas ? `${Math.round(earnings.totalEntregas * 0.5)}h` : '0h';
  }, [earnings]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: themeColors.background },
        content: { flex: 1, paddingHorizontal: spacing.lg },
        periodContainer: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.md,
          paddingTop: spacing.md,
        },
        periodButton: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: themeColors.surfaceContainer,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        periodButtonActive: {
          backgroundColor: themeColors.primary[500],
          borderColor: themeColors.primary[500],
        },
        periodText: { fontSize: 14, fontWeight: '600', color: themeColors.neutral[500] },
        periodTextActive: { color: themeColors.white },
        totalCard: {
          backgroundColor: themeColors.primary[500],
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
        },
        totalLabel: { fontSize: 14, color: themeColors.white, opacity: 0.8, marginBottom: 4 },
        totalValue: {
          fontSize: 36,
          fontWeight: '800',
          color: themeColors.white,
          marginBottom: spacing.md,
        },
        totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
        totalItem: { alignItems: 'center' },
        totalItemValue: { fontSize: 16, fontWeight: '700', color: themeColors.white },
        totalItemLabel: { fontSize: 12, color: themeColors.white, opacity: 0.7, marginTop: 2 },
        chartCard: {
          backgroundColor: themeColors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        chartTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: themeColors.onSurface,
          marginBottom: spacing.md,
        },
        chartContainer: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: 120,
          gap: 4,
        },
        chartBar: {
          width: '7%',
          backgroundColor: themeColors.primary[500],
          borderRadius: 4,
          opacity: 0.8,
        },
        chartBarActive: { opacity: 1 },
        statsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        statCard: {
          width: '48%',
          backgroundColor: themeColors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        statIcon: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: themeColors.primary[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        },
        statValue: {
          fontSize: 18,
          fontWeight: '800',
          color: themeColors.onSurface,
          marginBottom: 2,
        },
        statLabel: { fontSize: 12, color: themeColors.neutral[500] },
        payoutCard: {
          backgroundColor: themeColors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: themeColors.surfaceVariant,
        },
        payoutTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: themeColors.onSurface,
          marginBottom: spacing.md,
        },
        payoutItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.surfaceVariant,
        },
        payoutDate: { fontSize: 14, color: themeColors.neutral[500] },
        payoutAmount: { fontSize: 15, fontWeight: '700', color: themeColors.onSurface },
        payoutStatus: {
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: themeColors.primary[100],
        },
        payoutStatusText: { fontSize: 11, fontWeight: '700', color: themeColors.primary[500] },
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Meus Ganhos" showBack showCart={false} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Meus Ganhos" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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

        {error ? (
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
        ) : earnings ? (
          <>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total em {activePeriod.toLowerCase()}</Text>
              <Text style={styles.totalValue}>
                Kz {(earnings.totalGanho || 0).toLocaleString()}
              </Text>
              <View style={styles.totalRow}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalItemValue}>{earnings.totalEntregas || 0}</Text>
                  <Text style={styles.totalItemLabel}>Entregas</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalItemValue}>
                    Kz {(earnings.mediaPorEntrega || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.totalItemLabel}>Média</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalItemValue}>{totalHours}</Text>
                  <Text style={styles.totalItemLabel}>Online</Text>
                </View>
              </View>
            </View>

            {chartData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Desempenho</Text>
                <View style={styles.chartContainer}>
                  {chartData.map((value, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chartBar,
                        index === chartData.length - 1 && styles.chartBarActive,
                        { height: `${(value / maxValue) * 100}%` },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color={themeColors.primary[500]}
                  />
                </View>
                <Text style={styles.statValue}>
                  Kz {(earnings.mediaPorEntrega || 0).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Por entrega</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <MaterialCommunityIcons
                    name="motorbike"
                    size={20}
                    color={themeColors.primary[500]}
                  />
                </View>
                <Text style={styles.statValue}>{earnings.totalEntregas || 0}</Text>
                <Text style={styles.statLabel}>Entregas</Text>
              </View>
            </View>

            {earnings.detalhe && earnings.detalhe.length > 0 && (
              <View style={styles.payoutCard}>
                <Text style={styles.payoutTitle}>Detalhes por período</Text>
                {earnings.detalhe.map((item, index) => (
                  <View key={index} style={styles.payoutItem}>
                    <Text style={styles.payoutDate}>{item.data}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={styles.payoutAmount}>Kz {item.ganho.toLocaleString()}</Text>
                      <View style={styles.payoutStatus}>
                        <Text style={styles.payoutStatusText}>{item.entregas}x</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash" size={32} color={themeColors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhum dado de ganhos disponível.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
