import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, variant = 'primary', size = 'medium', disabled = false, loading = false }: ButtonProps) {
  const { colors } = useTheme();
  const getBg = () => disabled ? colors.neutral[300] : variant === 'primary' ? colors.primary[500] : 'transparent';
  const getText = () => disabled ? colors.neutral[500] : variant === 'primary' ? colors.white : colors.primary[500];
  const pad = size === 'small' ? spacing.sm : size === 'large' ? spacing.lg : spacing.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBg(), paddingVertical: pad, paddingHorizontal: pad * 1.5,
          borderWidth: variant === 'secondary' ? 2 : 0, borderColor: colors.primary[500] },
      ]}
    >
      {loading ? <ActivityIndicator color={getText()} size="small" /> : <Text style={[styles.text, { color: getText() }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '600' },
});