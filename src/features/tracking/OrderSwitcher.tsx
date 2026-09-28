import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { Order } from '../../store/ordersSlice';
import { spacing } from '../../theme';
import { STATUS_CONFIG } from './constants';

interface OrderSwitcherProps {
  orders: Order[];
  selectedId: string | null | undefined;
  onSelect: (orderId: string) => void;
}

export function OrderSwitcher({ orders, selectedId, onSelect }: OrderSwitcherProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        orderSelector: {
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.md,
          flexWrap: 'wrap',
        },
        orderChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 12,
          backgroundColor: colors.surfaceContainer,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        orderChipActive: {
          backgroundColor: colors.primary[500],
          borderColor: colors.primary[500],
        },
        orderChipText: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.onSurface,
        },
        orderChipTextActive: {
          color: colors.white,
        },
      }),
    [colors],
  );

  if (orders.length <= 1) return null;

  return (
    <View style={styles.orderSelector}>
      {orders.map((order) => {
        const isActive = selectedId === order.id;
        const status = STATUS_CONFIG[order.status];
        return (
          <TouchableOpacity
            key={order.id}
            style={[styles.orderChip, isActive && styles.orderChipActive]}
            onPress={() => onSelect(order.id)}
          >
            <MaterialCommunityIcons
              name={status.icon as any}
              size={16}
              color={isActive ? colors.white : status.color}
            />
            <Text style={[styles.orderChipText, isActive && styles.orderChipTextActive]}>
              Pedido #{order.id.slice(-4)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
