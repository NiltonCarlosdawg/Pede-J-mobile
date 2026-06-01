import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, spacing } from '../../theme';
import { useTheme } from '../../hooks/useTheme';
import type { PaymentMethod, PaymentMethodType } from '../../types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSelect?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

const METHOD_ICONS: Record<PaymentMethodType, string> = {
  paypay: "wallet",
  multicaixa_express: "bank-transfer",
  unitel_money: "cellphone",
  facipay: "credit-card-wireless",
};

const METHOD_LABELS: Record<PaymentMethodType, string> = {
  paypay: "PayPay",
  multicaixa_express: "Multicaixa Express",
  unitel_money: "Unitel Money",
  facipay: "FaciPay",
};

export function PaymentMethodCard({
  method,
  onSelect,
  onDelete,
  isSelected = false,
}: PaymentMethodCardProps) {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: colors.neutral[200],
      alignItems: 'center',
    },
    containerSelected: {
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[50],
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainerSelected: {
      backgroundColor: colors.primary[500],
    },
    details: {
      flex: 1,
    },
    methodType: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.neutral[900],
      marginBottom: spacing.xs / 2,
    },
    methodSubtitle: {
      fontSize: 13,
      color: colors.neutral[600],
      marginBottom: spacing.xs / 2,
    },
    defaultBadge: {
      backgroundColor: colors.primary[100],
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.full,
      marginLeft: spacing.sm,
    },
    defaultText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary[700],
      textTransform: 'uppercase',
    },
    checkmark: {
      marginLeft: spacing.sm,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginLeft: spacing.md,
    },
    actionButton: {
      padding: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }), [colors]);

  const icon = METHOD_ICONS[method.type] as any;
  const label = METHOD_LABELS[method.type] || method.label;

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isSelected ? colors.white : colors.primary[500]}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.methodType}>{label}</Text>
          <Text style={styles.methodSubtitle}>Pagamento digital</Text>
        </View>

        {method.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Padrão</Text>
          </View>
        )}
      </View>

      {isSelected && (
        <View style={styles.checkmark}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={colors.primary[500]}
          />
        </View>
      )}

      {onDelete && (
        <View style={styles.actions}>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="trash-can"
                size={18}
                color={colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
