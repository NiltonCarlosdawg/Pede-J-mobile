import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { Order } from '../../store/ordersSlice';
import { startVoipCall } from '../../services/voip';
import { shadowStyle } from '../../utils/shadow';
import { spacing } from '../../theme';
import { RESTAURANT_IMAGES, RESTAURANT_NAMES, STATUS_CONFIG } from './constants';

interface SelectedOrderCardProps {
  order: Order;
  hasRealLocation: boolean;
  estimatedMinutes: number | null;
  distance: number | null;
  lastKnownAgeMs: number | null;
}

export function SelectedOrderCard({
  order,
  hasRealLocation,
  estimatedMinutes,
  distance,
  lastKnownAgeMs,
}: SelectedOrderCardProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        statusSection: {
          alignItems: 'center',
          marginBottom: 24,
        },
        arrivalTime: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.onSurface,
        },
        arrivalRange: {
          fontSize: 14,
          color: colors.neutral[500],
          marginTop: 4,
        },
        restaurantCard: {
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.surfaceContainer,
        },
        restaurantImage: {
          width: 56,
          height: 56,
          borderRadius: 8,
        },
        restaurantInfo: {
          flex: 1,
        },
        restaurantName: {
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.onSurface,
        },
        orderNumber: {
          fontSize: 14,
          color: colors.neutral[500],
        },
        actionButtonsContainer: {
          flexDirection: 'row',
          gap: spacing.sm,
        },
        actionButton: {
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        },
        actionButtonCircle: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
          ...shadowStyle({
            color: colors.primary[500],
            offsetY: 2,
            blur: 4,
            opacity: 0.3,
            elevation: 4,
          }),
        },
        actionButtonText: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.primary[500],
        },
      }),
    [colors],
  );

  return (
    <>
      <View style={styles.statusSection}>
        <Text style={styles.arrivalTime}>
          {order.status === 'delivering' && hasRealLocation && estimatedMinutes != null
            ? `Chegando em ${estimatedMinutes} min`
            : order.status === 'delivering'
              ? 'Entregador a caminho'
              : order.status === 'ready'
                ? 'Pronto para entrega'
                : 'Preparando seu pedido'}
        </Text>
        <Text style={styles.arrivalRange}>
          {order.status === 'delivering' ? (
            hasRealLocation && distance != null ? (
              <Text>
                {distance.toFixed(1)} km restantes · Pedido #{order.id.slice(-4)} ·{' '}
                {STATUS_CONFIG[order.status].label}
                {lastKnownAgeMs != null && lastKnownAgeMs > 30000
                  ? ` · actualizado há ${Math.round(lastKnownAgeMs / 1000)}s`
                  : ''}
              </Text>
            ) : (
              <Text>
                Pedido #{order.id.slice(-4)} · {STATUS_CONFIG[order.status].label} · Aguardando
                localização
              </Text>
            )
          ) : (
            <Text>
              Pedido #{order.id.slice(-4)} · {STATUS_CONFIG[order.status].label}
            </Text>
          )}
        </Text>
        {order.status === 'delivering' && !hasRealLocation ? (
          <Text
            style={{
              fontSize: 12,
              color: colors.neutral[500],
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            A localização em tempo real aparecerá quando o entregador iniciar a partilha e o
            servidor confirmar.
          </Text>
        ) : null}
      </View>

      <View style={styles.restaurantCard}>
        <Image
          source={{
            uri:
              RESTAURANT_IMAGES[order.id] ??
              'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
          }}
          style={styles.restaurantImage}
        />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{RESTAURANT_NAMES[order.id] ?? 'Restaurante'}</Text>
          <Text style={styles.orderNumber}>Pedido #{order.id.slice(-4)}</Text>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/chat', params: { orderId: order.id } })}
          >
            <View style={styles.actionButtonCircle}>
              <MaterialCommunityIcons name="chat" size={22} color={colors.white} />
            </View>
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (order.status === 'delivered' || order.status === 'cancelled') && { opacity: 0.4 },
            ]}
            disabled={order.status === 'delivered' || order.status === 'cancelled'}
            onPress={() => startVoipCall(order.id)}
          >
            <View style={styles.actionButtonCircle}>
              <MaterialCommunityIcons name="phone" size={22} color={colors.white} />
            </View>
            <Text style={styles.actionButtonText}>Ligar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {order.driver && (
        <View
          style={[
            styles.restaurantCard,
            { marginTop: -12, backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          <View
            style={[
              styles.actionButtonCircle,
              {
                backgroundColor: colors.primary[100],
                width: 44,
                height: 44,
                borderRadius: 14,
              },
            ]}
          >
            <MaterialCommunityIcons name="account" size={22} color={colors.primary[500]} />
          </View>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{order.driver.name}</Text>
            <Text style={styles.orderNumber}>{order.driver.vehicle ?? 'Entregador'}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/chat', params: { orderId: order.id } })}
          >
            <View style={[styles.actionButtonCircle, { width: 40, height: 40, borderRadius: 20 }]}>
              <MaterialCommunityIcons name="chat" size={18} color={colors.white} />
            </View>
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
