import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  icon?: string;
  iconPosition?: 'left' | 'right';
  error?: boolean;
  disabled?: boolean;
  numberOfLines?: number;
  multiline?: boolean;
  maxLength?: number;
}

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  iconPosition = 'left',
  error = false,
  disabled = false,
  numberOfLines,
  multiline = false,
  maxLength,
}: InputProps) {
  const borderColor = error ? colors.error : colors.neutral[200];
  const backgroundColor = disabled ? colors.neutral[100] : colors.white;

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]}>
      {icon && iconPosition === 'left' && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.neutral[400]}
          style={styles.iconLeft}
        />
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          icon && iconPosition === 'left' && styles.inputWithLeftIcon,
          icon && iconPosition === 'right' && styles.inputWithRightIcon,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[300]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={!disabled}
        numberOfLines={numberOfLines}
        multiline={multiline}
        maxLength={maxLength}
      />
      {icon && iconPosition === 'right' && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.neutral[400]}
          style={styles.iconRight}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
    color: colors.neutral[900],
  },
  multilineInput: {
    minHeight: 100,
    verticalAlign: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: spacing.sm,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
