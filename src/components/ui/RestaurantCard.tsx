import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: string;
  onPress: () => void;
}

export function RestaurantCard({ title, subtitle, image, rating, deliveryTime, deliveryFee, onPress }: CardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {deliveryFee === 'Grátis' && <View style={styles.badge}><Text style={styles.badgeText}>Entrega Grátis</Text></View>}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        <View style={styles.info}>
          {rating && <Text style={styles.rating}>⭐ {rating}</Text>}
          {deliveryTime && <Text style={styles.infoText}>{deliveryTime}</Text>}
          {deliveryFee && <Text style={styles.infoText}>{deliveryFee}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md, ...shadows.md },
  imageContainer: { position: 'relative', width: '100%', aspectRatio: 16 / 9 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.secondary[500], paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { color: colors.neutral[900], fontSize: 12, fontWeight: '600' },
  content: { padding: spacing.md },
  title: { fontSize: 18, fontWeight: '600', color: colors.neutral[900], marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.neutral[700], marginBottom: spacing.sm },
  info: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rating: { fontSize: 14, fontWeight: '600', color: colors.neutral[900] },
  infoText: { fontSize: 14, color: colors.neutral[500] },
});