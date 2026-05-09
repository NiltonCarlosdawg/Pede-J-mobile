import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'primary', size = 'medium', icon }: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[100];
      case 'secondary':
        return colors.secondary[100];
      case 'success':
        return colors.success;
      case 'danger':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.primary[100];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary[700];
      case 'secondary':
        return colors.secondary[700];
      case 'success':
        return colors.white;
      case 'danger':
        return colors.white;
      case 'warning':
        return colors.white;
      case 'info':
        return colors.white;
      default:
        return colors.primary[700];
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: spacing.xs, paddingVertical: 2 };
      case 'large':
        return { paddingHorizontal: spacing.md, paddingVertical: spacing.sm };
      case 'medium':
      default:
        return { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      case 'medium':
      default:
        return 14;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});
