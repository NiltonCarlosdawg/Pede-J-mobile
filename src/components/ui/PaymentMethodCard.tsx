import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme';
import type { PaymentMethod } from '../../types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

export function PaymentMethodCard({
  method,
  onSelect,
  onEdit,
  onDelete,
  isSelected = false,
}: PaymentMethodCardProps) {
  const getIcon = () => {
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return 'credit-card';
      case 'pix':
        return 'qrcode';
      case 'wallet':
        return 'wallet';
      case 'cash':
        return 'cash';
      default:
        return 'credit-card';
    }
  };

  const getLabel = () => {
    switch (method.type) {
      case 'credit_card':
        return 'Cartão de crédito';
      case 'debit_card':
        return 'Cartão de débito';
      case 'pix':
        return 'Pix';
      case 'wallet':
        return 'Carteira';
      case 'cash':
        return 'Dinheiro';
      default:
        return 'Método de pagamento';
    }
  };

  const getCardDisplay = () => {
    if (method.type === 'pix') {
      return `Chave: ${method.pixKey?.substring(0, 10)}...`;
    }
    if (method.cardNumber) {
      return `••• •••• •••• ${method.cardNumber}`;
    }
    return method.label;
  };

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
            name={getIcon()}
            size={24}
            color={isSelected ? colors.white : colors.primary[500]}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.methodType}>{getLabel()}</Text>
          {method.cardHolder && (
            <Text style={styles.cardHolder}>{method.cardHolder}</Text>
          )}
          <Text style={styles.cardNumber}>{getCardDisplay()}</Text>
          {method.expiryDate && (
            <Text style={styles.expiryDate}>Exp: {method.expiryDate}</Text>
          )}
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

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={styles.actionButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={colors.neutral[500]}
              />
            </TouchableOpacity>
          )}
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.primary[50] || colors.neutral[50],
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
  cardHolder: {
    fontSize: 13,
    color: colors.neutral[600],
    marginBottom: spacing.xs / 2,
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.xs / 2,
  },
  expiryDate: {
    fontSize: 12,
    color: colors.neutral[500],
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
});
