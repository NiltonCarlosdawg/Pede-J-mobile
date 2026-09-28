import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme';
import { LUANDA_NEIGHBORHOODS } from './constants';

interface ZoneModalProps {
  visible: boolean;
  selectedZones: string[];
  toggleZone: (neighborhood: string) => void;
  onClose: () => void;
}

export function ZoneModal({ visible, selectedZones, toggleZone, onClose }: ZoneModalProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        },
        modalContent: {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '80%',
          paddingTop: spacing.lg,
          paddingBottom: spacing.xxl,
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.onSurface,
        },
        modalClose: {
          padding: spacing.xs,
        },
        modalList: {
          paddingHorizontal: spacing.lg,
        },
        modalItem: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        modalItemLabel: {
          fontSize: 15,
          color: colors.onSurface,
        },
        modalConfirmButton: {
          marginHorizontal: spacing.lg,
          marginTop: spacing.lg,
          backgroundColor: colors.primary[500],
          paddingVertical: spacing.md,
          borderRadius: 16,
          alignItems: 'center',
        },
        modalConfirmText: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.white,
        },
      }),
    [colors],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar bairros</Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalList}>
            {LUANDA_NEIGHBORHOODS.map((neighborhood) => {
              const isSelected = selectedZones.includes(neighborhood);
              return (
                <TouchableOpacity
                  key={neighborhood}
                  style={styles.modalItem}
                  onPress={() => toggleZone(neighborhood)}
                >
                  <Text style={styles.modalItemLabel}>{neighborhood}</Text>
                  <MaterialCommunityIcons
                    name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={22}
                    color={isSelected ? colors.primary[500] : colors.neutral[300]}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.modalConfirmButton} onPress={onClose}>
            <Text style={styles.modalConfirmText}>Confirmar ({selectedZones.length})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
