import React, { useMemo } from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing, borderRadius, shadows } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: string;
  distance?: string;
  onPress?: () => void;
  favorite?: boolean;
  onFavoritePress?: () => void;
}

export function RestaurantCard({ title, subtitle, image, rating, deliveryTime, deliveryFee, distance, onPress, favorite, onFavoritePress }: CardProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: spacing.md,
      ...shadows.md,
    },
    imageContainer: { position: 'relative', width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surfaceContainerHighet },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    favoriteBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.8)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { padding: spacing.md },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
    title: { fontSize: 18, fontWeight: '600', color: colors.neutral[900], flex: 1 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    ratingText: { fontSize: 12, fontWeight: '600', color: colors.secondary[500] },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    subtitle: { fontSize: 14, color: colors.neutral[500] },
    dot: { marginHorizontal: 6, color: colors.neutral[300] },
    deliveryRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.neutral[100], gap: spacing.lg },
    deliveryInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deliveryText: { fontSize: 14, color: colors.neutral[700] },
    freeDelivery: { color: colors.primary[500], fontWeight: '600' },
  }), [colors]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image || 'https://images.unsplash.com/photo-1517248135467-4c7aad601933?w=400' }}
          style={styles.image}
        />
        {favorite !== undefined && (
          <TouchableOpacity style={styles.favoriteBtn} onPress={onFavoritePress}>
            <MaterialCommunityIcons
              name={favorite ? "heart" : "heart-outline"}
              size={20}
              color={favorite ? colors.primary[500] : colors.neutral[500]}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {rating && (
            <View style={styles.ratingBadge}>
              <MaterialCommunityIcons name="star" size={14} color={colors.secondary[500]} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.dot}>•</Text>
          {distance && <Text style={styles.subtitle}>{distance}</Text>}
        </View>
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.neutral[700]} />
            <Text style={styles.deliveryText}>{deliveryTime}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <MaterialCommunityIcons name="moped" size={16} color={deliveryFee === 'Grátis' ? colors.primary[500] : colors.neutral[700]} />
            <Text style={[styles.deliveryText, deliveryFee === 'Grátis' && styles.freeDelivery]}>
              {deliveryFee}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
