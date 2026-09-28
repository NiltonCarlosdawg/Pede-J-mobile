import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { requestLocationPermissions } from '../../services/location';
import { safeGetItem, safeSetItem } from '../../utils/storage';
import { LOCATION_SHARING_STORAGE_KEY } from '../../hooks/useDriverLocationPublisher';
import { useToggleLocationSharingMutation } from '../../hooks/useApi';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme';

interface SettingsSectionProps {
  onRequestLogout: () => void;
}

export function SettingsSection({ onRequestLogout }: SettingsSectionProps) {
  const { colors } = useTheme();
  const [toggleLocationSharing] = useToggleLocationSharingMutation();
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      const stored = await safeGetItem(LOCATION_SHARING_STORAGE_KEY);
      if (stored === '1') {
        setLocationEnabled(true);
        return;
      }
      const granted = await requestLocationPermissions();
      setLocationEnabled(granted && stored !== '0');
    };
    checkLocation();
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.onSurface,
        },
        menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        menuText: {
          flex: 1,
          fontSize: 15,
          color: colors.onSurface,
          marginLeft: spacing.md,
        },
        logoutItem: {
          marginTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.error,
          opacity: 0.8,
        },
        logoutIcon: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        },
        logoutText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.error,
          marginLeft: spacing.md,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Configurações</Text>
      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="bell-outline" size={22} color={colors.neutral[500]} />
        <Text style={styles.menuText}>Notificações</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
      </TouchableOpacity>
      <View style={styles.menuItem}>
        <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.neutral[500]} />
        <Text style={styles.menuText}>Compartilhar localização</Text>
        <Switch
          value={locationEnabled}
          onValueChange={async (value) => {
            if (value) {
              const granted = await requestLocationPermissions();
              if (!granted) {
                setLocationEnabled(false);
                Alert.alert(
                  'Permissão necessária',
                  'Ative a localização para partilhar a posição.',
                );
                return;
              }
              try {
                await toggleLocationSharing(true).unwrap();
                await safeSetItem(LOCATION_SHARING_STORAGE_KEY, '1');
                setLocationEnabled(true);
              } catch (err) {
                console.error('Failed to enable location sharing:', err);
                Alert.alert('Erro', 'Não foi possível activar a partilha no servidor.');
                setLocationEnabled(false);
              }
            } else {
              try {
                await toggleLocationSharing(false).unwrap();
              } catch (err) {
                console.warn('Failed to disable location sharing:', err);
              }
              await safeSetItem(LOCATION_SHARING_STORAGE_KEY, '0');
              setLocationEnabled(false);
            }
          }}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.white}
        />
      </View>
      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.neutral[500]} />
        <Text style={styles.menuText}>Método de pagamento</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <MaterialCommunityIcons name="help-circle-outline" size={22} color={colors.neutral[500]} />
        <Text style={styles.menuText}>Ajuda e Suporte</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.neutral[300]} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={onRequestLogout}>
        <View style={styles.logoutIcon}>
          <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
        </View>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
