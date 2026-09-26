import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../src/components/ui/Header';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useGetRestaurantOrdersQuery,
  useUpdateRestaurantOrderStatusMutation,
} from '../../src/hooks/useApi';
import type { Order, OrderPage } from '../../src/types';
import type { RestaurantOrder, RestaurantOrderStatus } from '../../src/store/restaurantOrdersSlice';

type FilterType = 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Novos' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'preparing', label: 'Preparando' },
  { key: 'ready', label: 'Prontos' },
  { key: 'delivered', label: 'Entregues' },
];

const toRestaurantOrders = (result: OrderPage | Order[] | undefined): RestaurantOrder[] => {
  const rows = Array.isArray(result) ? result : (result?.data ?? []);
  // O endpoint /restaurant/orders devolve o formato do painel (clientName, items com nome/preço),
  // que o tipo Order da API não reflete — o cast replica o comportamento anterior (res.data).
  return rows as unknown as RestaurantOrder[];
};

export default function RestaurantOrdersScreen() {
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);

  const statusParam = activeFilter === 'all' ? undefined : activeFilter;
  const {
    data: ordersData,
    isError,
    error: queryError,
    refetch,
  } = useGetRestaurantOrdersQuery({ status: statusParam, limit: 50 });
  const [updateOrderStatus] = useUpdateRestaurantOrderStatusMutation();

  // Spinner em carga inicial, troca de filtro e novo retry (sem dados e sem erro),
  // igual ao antigo estado `loading` local — sem piscar em refetches de invalidação.
  const loading = ordersData === undefined && !isError;
  const error = isError && ordersData === undefined ? 'Erro ao carregar pedidos.' : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza os pedidos da API com o estado local das mutações optimistas
    if (ordersData) setOrders(toRestaurantOrders(ordersData));
  }, [ordersData]);

  useEffect(() => {
    if (isError) console.error('[RestaurantOrders] fetchOrders error:', queryError);
  }, [isError, queryError]);

  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: RestaurantOrderStatus) => {
      try {
        await updateOrderStatus({ orderId, status: newStatus }).unwrap();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o,
          ),
        );
      } catch (err) {
        console.error('[RestaurantOrders] updateStatus error:', err);
      }
    },
    [updateOrderStatus],
  );

  const getNextStatus = useCallback(
    (currentStatus: RestaurantOrderStatus): RestaurantOrderStatus | null => {
      switch (currentStatus) {
        case 'pending':
          return 'confirmed';
        case 'confirmed':
          return 'preparing';
        case 'preparing':
          return 'ready';
        case 'ready':
          return 'delivering';
        default:
          return null;
      }
    },
    [],
  );

  const getActionLabel = useCallback((status: RestaurantOrderStatus): string => {
    switch (status) {
      case 'pending':
        return 'Confirmar';
      case 'confirmed':
        return 'Iniciar Preparo';
      case 'preparing':
        return 'Marcar Pronto';
      case 'ready':
        return 'Enviar Entrega';
      default:
        return '';
    }
  }, []);

  const getStatusColor = useCallback(
    (status: string) => {
      switch (status) {
        case 'pending':
          return colors.warning;
        case 'confirmed':
          return colors.info;
        case 'preparing':
          return colors.primary[500];
        case 'ready':
          return colors.success;
        case 'delivering':
          return colors.secondary[500];
        case 'delivered':
          return colors.success;
        case 'cancelled':
          return colors.error;
        default:
          return colors.neutral[500];
      }
    },
    [colors],
  );

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'Novo';
      case 'confirmed':
        return 'Confirmado';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Pronto';
      case 'delivering':
        return 'A caminho';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return `Kz ${value.toLocaleString('pt-AO')}`;
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1 },
        filterContainer: {
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        },
        filterButton: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: colors.surfaceContainer,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        filterButtonActive: {
          backgroundColor: colors.primary[500],
          borderColor: colors.primary[500],
        },
        filterText: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.neutral[500],
        },
        filterTextActive: {
          color: colors.white,
        },
        listContent: {
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        },
        orderCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        orderHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.sm,
        },
        orderInfo: { flex: 1 },
        orderClient: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.onSurface,
          marginBottom: 2,
        },
        orderTime: {
          fontSize: 12,
          color: colors.neutral[500],
        },
        orderTotal: {
          fontSize: 16,
          fontWeight: '800',
          color: colors.primary[500],
        },
        itemsList: {
          marginBottom: spacing.sm,
        },
        itemRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 4,
        },
        itemName: {
          fontSize: 14,
          color: colors.neutral[700],
          flex: 1,
        },
        itemQty: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.neutral[500],
          marginRight: spacing.sm,
        },
        itemPrice: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.onSurface,
        },
        orderFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.surfaceVariant,
        },
        statusBadge: {
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 8,
        },
        statusText: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.white,
        },
        actionButton: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: colors.primary[500],
        },
        actionButtonText: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.white,
        },
        emptyContainer: {
          alignItems: 'center',
          paddingVertical: spacing.xxl,
          gap: spacing.sm,
        },
        emptyText: {
          fontSize: 14,
          color: colors.neutral[500],
          textAlign: 'center',
        },
        errorContainer: {
          alignItems: 'center',
          paddingVertical: spacing.xxl,
          gap: spacing.sm,
        },
        errorText: {
          fontSize: 14,
          color: colors.error,
          textAlign: 'center',
        },
        retryButton: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: colors.primary[500],
        },
        retryText: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.white,
        },
      }),
    [colors],
  );

  const renderOrder = useCallback(
    ({ item }: { item: RestaurantOrder }) => {
      const nextStatus = getNextStatus(item.status);
      const actionLabel = getActionLabel(item.status);

      return (
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderClient}>{item.clientName}</Text>
              <Text style={styles.orderTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
          </View>

          <View style={styles.itemsList}>
            {item.items.map((orderItem) => (
              <View key={orderItem.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{orderItem.name}</Text>
                <Text style={styles.itemQty}>x{orderItem.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {formatCurrency(orderItem.price * orderItem.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.orderFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
            {nextStatus && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateStatus(item.id, nextStatus)}
              >
                <Text style={styles.actionButtonText}>{actionLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [
      getNextStatus,
      getActionLabel,
      getStatusColor,
      getStatusLabel,
      formatTime,
      formatCurrency,
      handleUpdateStatus,
      styles,
    ],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Pedidos" showBack={false} showCart={false} />

      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, activeFilter === filter.key && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="receipt" size={48} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
