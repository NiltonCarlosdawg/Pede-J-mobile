import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface ProductCardProps {
  title: string;
  description?: string;
  price: string;
  image?: string;
  badge?: string;
  isFeatured?: boolean;
  onAdd?: () => void;
  isAvailable?: boolean;
}

export function ProductCard({ 
  title, 
  description, 
  price, 
  image, 
  badge, 
  isFeatured,
  onAdd,
  isAvailable = true 
}: ProductCardProps) {
  if (isFeatured) {
    return (
      <TouchableOpacity style={[styles.featuredCard, !isAvailable && styles.disabled]}>
        <View style={styles.featuredImageContainer}>
          <Image 
            source={{ uri: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }} 
            style={styles.featuredImage} 
          />
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{title}</Text>
          <Text style={styles.featuredDescription} numberOfLines={3}>{description}</Text>
          <View style={styles.priceRow}>
<Text style={styles.featuredPrice}>{price}</Text>
            {isAvailable ? (
              <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.soldOut}>Esgotado</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, !isAvailable && styles.disabled]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' }} 
            style={styles.image} 
          />
          {isAvailable && (
            <TouchableOpacity style={styles.addButtonSmall} onPress={onAdd}>
              <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurface,
  },
  description: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary[500],
  },
  addButtonSmall: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  featuredCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  featuredImageContainer: {
    width: '50%',
    height: 180,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surfaceContainerLowest,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary[500],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  disabled: {
    opacity: 0.6,
  },
  soldOut: {
    fontSize: 14,
    color: colors.neutral[500],
  },
});