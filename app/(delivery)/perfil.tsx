import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../src/components/ui/Header';
import { ConfirmDialog } from '../../src/components/ui/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { clearSession } from '../../src/store/authSlice';
import { clearCart } from '../../src/store/cartSlice';
import { clearStoredSession } from '../../src/services/session';
import { useLogoutMutation } from '../../src/hooks/useApi';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { DocumentSection } from '../../src/features/delivery-profile/DocumentSection';
import { SettingsSection } from '../../src/features/delivery-profile/SettingsSection';
import { ZoneModal } from '../../src/features/delivery-profile/ZoneModal';

export default function DeliveryProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const [logout] = useLogoutMutation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [, setIsLoggingOut] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZones, setSelectedZones] = useState<string[]>(['Maianga', 'Ingombota']);

  const toggleZone = useCallback((neighborhood: string) => {
    setSelectedZones((prev) =>
      prev.includes(neighborhood)
        ? prev.filter((z) => z !== neighborhood)
        : [...prev, neighborhood],
    );
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          flex: 1,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
        },
        profileCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          alignItems: 'center',
        },
        avatarContainer: {
          position: 'relative',
          marginBottom: spacing.md,
        },
        avatar: {
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 3,
          borderColor: colors.primary[500],
        },
        statusBadge: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.primary[500],
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.white,
        },
        statusDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.white,
        },
        statusText: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.white,
        },
        name: {
          fontSize: 22,
          fontWeight: '700',
          color: colors.onSurface,
          marginBottom: 4,
        },
        email: {
          fontSize: 14,
          color: colors.neutral[500],
          marginBottom: spacing.lg,
        },
        zoneCard: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        zoneInfo: {
          flex: 1,
        },
        zoneTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.onSurface,
          marginBottom: 4,
        },
        zoneCount: {
          fontSize: 13,
          color: colors.neutral[500],
        },
        zoneTagContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.xs,
          marginTop: spacing.sm,
        },
        zoneTag: {
          backgroundColor: colors.primary[100],
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          borderRadius: 12,
        },
        zoneTagText: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.primary[500],
        },
        zoneTagActive: {
          backgroundColor: colors.primary[500],
        },
        zoneTagTextActive: {
          color: colors.white,
        },
      }),
    [colors],
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    try {
      await logout()
        .unwrap()
        .catch(() => undefined);
    } finally {
      await clearStoredSession();
      dispatch(clearCart());
      dispatch(clearSession());
      router.replace('/(auth)/login');
      setIsLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Meu Perfil" showBack showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar ??
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
              }}
              style={styles.avatar}
            />
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>

          <Text style={styles.name}>{user?.name ?? 'Entregador'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <DocumentSection />

        <TouchableOpacity
          style={styles.zoneCard}
          onPress={() => setShowZoneModal(true)}
          activeOpacity={0.7}
        >
          <View style={styles.zoneInfo}>
            <Text style={styles.zoneTitle}>Zona de Circulação</Text>
            <Text style={styles.zoneCount}>
              {selectedZones.length}{' '}
              {selectedZones.length === 1 ? 'bairro selecionado' : 'bairros selecionados'}
            </Text>
            {selectedZones.length > 0 && (
              <View style={styles.zoneTagContainer}>
                {selectedZones.slice(0, 3).map((zone) => (
                  <View key={zone} style={styles.zoneTag}>
                    <Text style={styles.zoneTagText}>{zone}</Text>
                  </View>
                ))}
                {selectedZones.length > 3 && (
                  <View style={styles.zoneTag}>
                    <Text style={styles.zoneTagText}>+{selectedZones.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[300]} />
        </TouchableOpacity>

        <SettingsSection onRequestLogout={() => setShowLogoutConfirm(true)} />
      </ScrollView>

      <ZoneModal
        visible={showZoneModal}
        selectedZones={selectedZones}
        toggleZone={toggleZone}
        onClose={() => setShowZoneModal(false)}
      />

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o aplicativo."
        confirmText="Sair"
        cancelText="Cancelar"
        icon="logout-variant"
        iconColor={colors.error}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
}
