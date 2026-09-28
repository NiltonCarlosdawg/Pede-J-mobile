import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Header } from '../../src/components/ui/Header';
import { useTheme } from '../../src/hooks/useTheme';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../src/store';
import { selectOrders, Order } from '../../src/store/ordersSlice';
import { spacing, formatPrice } from '../../src/theme';
import { shadowStyle } from '../../src/utils/shadow';
import { OrderSwitcher } from '../../src/features/tracking/OrderSwitcher';
import { SelectedOrderCard } from '../../src/features/tracking/SelectedOrderCard';
import { TrackingMapSection } from '../../src/features/tracking/TrackingMapSection';
import { TrackingSteps } from '../../src/features/tracking/TrackingSteps';
import { STATUS_CONFIG } from '../../src/features/tracking/constants';
import { useOrderTracking } from '../../src/features/tracking/useOrderTracking';

export default function TrackingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const orders = useAppSelector(selectOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const selectedOrder =
    activeOrders.find((o) => o.id === selectedOrderId) ?? activeOrders[0] ?? null;

  const {
    restaurantLocation,
    customerLocation,
    hasRoute,
    driverLocation,
    distance,
    estimatedMinutes,
    hasRealLocation,
    lastKnownAgeMs,
  } = useOrderTracking(selectedOrder);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingHorizontal: 20,
          paddingBottom: 48,
          marginTop: -24,
          ...shadowStyle({ offsetY: -8, blur: 30, opacity: 0.1 }),
        },
        handle: {
          width: 48,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.neutral[300],
          alignSelf: 'center',
          marginVertical: 16,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '800',
          color: colors.onSurface,
          marginBottom: spacing.md,
          marginTop: spacing.sm,
        },
        historyCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        historyHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        },
        historyId: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.neutral[500],
        },
        statusBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 8,
        },
        statusText: {
          fontSize: 12,
          fontWeight: '700',
        },
        historyItems: {
          marginBottom: spacing.sm,
        },
        itemText: {
          fontSize: 14,
          color: colors.onSurface,
          marginBottom: 2,
        },
        historyFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: spacing.sm,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceVariant,
        },
        historyDate: {
          fontSize: 12,
          color: colors.neutral[500],
        },
        historyTotal: {
          fontSize: 16,
          fontWeight: '800',
          color: colors.primary[500],
        },
        emptyHistory: {
          alignItems: 'center',
          paddingVertical: spacing.xl,
        },
        emptyText: {
          fontSize: 14,
          color: colors.neutral[500],
          textAlign: 'center',
        },
        viewAllButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing.md,
          marginTop: spacing.sm,
        },
        viewAllText: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.primary[500],
        },
      }),
    [colors],
  );

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function renderHistoryOrder(order: Order) {
    const status = STATUS_CONFIG[order.status];
    return (
      <View key={order.id} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyId}>Pedido #{order.id.slice(-4)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <MaterialCommunityIcons name={status.icon as any} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.historyItems}>
          {order.items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.title}
            </Text>
          ))}
          {order.items.length > 2 && (
            <Text style={[styles.itemText, { color: colors.neutral[500] }]}>
              +{order.items.length - 2} itens
            </Text>
          )}
        </View>
        <View style={styles.historyFooter}>
          <Text style={styles.historyDate}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.historyTotal}>{formatPrice(order.total)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Acompanhamento" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Area - Real Map apenas com dados do Postgres (sem coordenadas mock) */}
        <TrackingMapSection
          hasRoute={hasRoute}
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
          driverLocation={driverLocation}
        />

        <View style={styles.content}>
          <View style={styles.handle} />

          {/* Order Selector */}
          <OrderSwitcher
            orders={activeOrders}
            selectedId={selectedOrder?.id}
            onSelect={setSelectedOrderId}
          />

          {selectedOrder ? (
            <>
              <SelectedOrderCard
                order={selectedOrder}
                hasRealLocation={hasRealLocation}
                estimatedMinutes={estimatedMinutes}
                distance={distance}
                lastKnownAgeMs={lastKnownAgeMs}
              />
              <TrackingSteps status={selectedOrder.status} />
            </>
          ) : (
            <View style={[styles.emptyHistory, { marginVertical: spacing.lg }]}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyText}>Nenhum pedido em andamento</Text>
              <TouchableOpacity
                style={[styles.viewAllButton, { marginTop: spacing.md }]}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.viewAllText}>Fazer um pedido</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>
          )}

          {/* Order History Section */}
          <Text style={styles.sectionTitle}>Pedidos anteriores</Text>
          {pastOrders.length > 0 ? (
            <>
              {pastOrders.slice(0, 3).map((order) => renderHistoryOrder(order))}
              {pastOrders.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(tabs)/pedidos')}
                >
                  <Text style={styles.viewAllText}>Ver todos os pedidos</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={colors.primary[500]}
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyHistory}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={48}
                color={colors.neutral[300]}
              />
              <Text style={styles.emptyText}>Nenhum pedido anterior</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
