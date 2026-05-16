import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { borderRadius, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
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
  returnKeyType,
  onSubmitEditing,
  icon,
  iconPosition = 'left',
  error = false,
  disabled = false,
  numberOfLines,
  multiline = false,
  maxLength,
}: InputProps) {
  const { colors } = useTheme();
  const borderColor = error ? colors.error : colors.neutral[200];
  const backgroundColor = disabled ? colors.neutral[100] : colors.surface;

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
      color: colors.onSurface,
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

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]}>
      {icon && iconPosition === 'left' && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.neutral[500]}
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
        returnKeyType={returnKeyType ?? "done"}
        onSubmitEditing={onSubmitEditing ?? (() => Keyboard.dismiss())}
        editable={!disabled}
        numberOfLines={numberOfLines}
        multiline={multiline}
        maxLength={maxLength}
      />
      {icon && iconPosition === 'right' && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.neutral[500]}
          style={styles.iconRight}
        />
      )}
    </View>
  );
}
