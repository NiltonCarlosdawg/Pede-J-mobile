import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

interface CategoryCardProps {
  name: string;
  image?: string;
  icon?: string;
  onPress?: () => void;
}

export function CategoryCard({ name, image, icon, onPress }: CategoryCardProps) {
  const getCategoryIcon = () => {
    switch (name.toLowerCase()) {
      case 'pizza': return 'pizza';
      case 'hambúrguer': return 'food';
      case 'burger': return 'food';
      case 'brasil': return 'food-variant';
      case 'brazilian': return 'food-variant';
      case 'japão': return 'sushi';
      case 'japanese': return 'sushi';
      case 'mais': return 'dots-horizontal';
      default: return 'food';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.iconPlaceholder}>
            <MaterialCommunityIcons 
              name={getCategoryIcon() as any} 
              size={32} 
              color={colors.neutral[500]} 
            />
          </View>
        )}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexShrink: 0, alignItems: 'center', width: 72 },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighet,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  image: { width: '100%', height: '100%', opacity: 0.8 },
  iconPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  labelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  label: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
});