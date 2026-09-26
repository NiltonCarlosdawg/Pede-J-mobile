import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { ConfirmDialog } from '../../src/components/ui/ConfirmDialog';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { clearSession } from '../../src/store/authSlice';
import { clearDemoSession } from '../../src/services/demoAuth';
import {
  useLogoutMutation,
  useToggleOpenMutation,
  useLazyGetMyRestaurantQuery,
  useUpdateOpeningHoursMutation,
  useUpdateRestaurantProfileMutation,
} from '../../src/hooks/useApi';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type ApiErrorLike = { message?: unknown; data?: { message?: unknown } | string };

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorLike | undefined;
  const message = e?.data && typeof e.data === 'object' ? e.data.message : e?.message;
  return typeof message === 'string' && message ? message : fallback;
};

export default function RestaurantProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const [updateProfile] = useUpdateRestaurantProfileMutation();
  const [updateOpeningHours] = useUpdateOpeningHoursMutation();
  const [toggleOpen] = useToggleOpenMutation();
  const [logout] = useLogoutMutation();
  const [fetchMyRestaurant] = useLazyGetMyRestaurantQuery();

  const [editing, setEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state — sem mocks: carregado da API real
  const [formName, setFormName] = useState(user?.name ?? '');
  const [formDescription, setFormDescription] = useState('');
  const [formPhone, setFormPhone] = useState(user?.phone ?? '');
  const [formDeliveryFee, setFormDeliveryFee] = useState('500');
  const [formDeliveryTime, setFormDeliveryTime] = useState('30-45 min');
  const [isOpen, setIsOpen] = useState(false);
  const [openingHours, setOpeningHours] = useState([
    { day: 1, open: '08:00', close: '22:00', active: false },
    { day: 2, open: '08:00', close: '22:00', active: false },
    { day: 3, open: '08:00', close: '22:00', active: false },
    { day: 4, open: '08:00', close: '22:00', active: false },
    { day: 5, open: '08:00', close: '23:00', active: false },
    { day: 6, open: '09:00', close: '23:00', active: false },
    { day: 0, open: '09:00', close: '21:00', active: false },
  ]);
  const [profileLoading, setProfileLoading] = useState(true);

  // Carrega perfil real da API (PostgreSQL) — sem dados mock
  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const r = (await fetchMyRestaurant().unwrap()) as any;
      if (r?.name) setFormName(r.name);
      if (r?.description) setFormDescription(r.description);
      if (r?.owner?.phone ?? r?.phone) setFormPhone(r.owner?.phone ?? r.phone);
      if (r?.deliveryFee != null) setFormDeliveryFee(String(Number(r.deliveryFee)));
      if (r?.deliveryTime) setFormDeliveryTime(r.deliveryTime);
      if (typeof r?.isOpen === 'boolean') setIsOpen(r.isOpen);
      if (Array.isArray(r?.openingHours)) {
        setOpeningHours((prev) =>
          prev.map((p) => {
            const found = r.openingHours.find((h: any) => h.diaSemana === p.day);
            return found
              ? { ...p, open: found.abre, close: found.fecha, active: true }
              : { ...p, active: false };
          }),
        );
      }
    } catch (err) {
      console.warn(
        '[RestaurantProfile] loadProfile sem dados ainda (restaurante precisa ser aprovado):',
        err,
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: formName,
        description: formDescription,
        phone: formPhone,
        deliveryFee: parseFloat(formDeliveryFee) || 0,
        deliveryTime: formDeliveryTime,
      }).unwrap();
      await updateOpeningHours(
        openingHours
          .filter((h) => h.active)
          .map((h) => ({ diaSemana: h.day, abre: h.open, fecha: h.close })),
      ).unwrap();
      await toggleOpen(isOpen).unwrap();
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado na API (PostgreSQL)!');
    } catch (err) {
      console.error('[RestaurantProfile] handleSave error:', err);
      Alert.alert('Erro', getApiErrorMessage(err, 'Não foi possível salvar na API real.'));
    } finally {
      setSaving(false);
    }
  }, [
    formName,
    formDescription,
    formPhone,
    formDeliveryFee,
    formDeliveryTime,
    openingHours,
    isOpen,
    updateProfile,
    updateOpeningHours,
    toggleOpen,
  ]);

  const handleLogout = useCallback(async () => {
    try {
      await logout()
        .unwrap()
        .catch(() => undefined);
    } finally {
      await clearDemoSession();
      const { clearCart } = await import('../../src/store/cartSlice');
      dispatch(clearCart());
      dispatch(clearSession());
    }
  }, [dispatch, logout]);

  const toggleDay = useCallback((index: number) => {
    setOpeningHours((prev) => prev.map((h, i) => (i === index ? { ...h, active: !h.active } : h)));
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { flex: 1, paddingHorizontal: spacing.lg },
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
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: colors.primary[100],
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.md,
        },
        avatarText: {
          fontSize: 32,
          fontWeight: '700',
          color: colors.primary[500],
        },
        profileName: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.onSurface,
          marginBottom: 4,
        },
        profileRole: {
          fontSize: 14,
          color: colors.neutral[500],
        },
        sectionCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.onSurface,
          marginBottom: spacing.md,
        },
        formGroup: {
          marginBottom: spacing.md,
        },
        formLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.neutral[700],
          marginBottom: spacing.xs,
        },
        formInput: {
          backgroundColor: colors.neutral[50],
          borderWidth: 1,
          borderColor: colors.neutral[200],
          borderRadius: 12,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          fontSize: 16,
          color: colors.onSurface,
        },
        formInputDisabled: {
          backgroundColor: colors.surfaceContainer,
          color: colors.neutral[500],
        },
        formRow: {
          flexDirection: 'row',
          gap: spacing.md,
        },
        switchRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        switchLabel: {
          fontSize: 14,
          color: colors.onSurface,
        },
        hoursRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        dayLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.onSurface,
          width: 40,
        },
        dayLabelInactive: {
          color: colors.neutral[400],
        },
        hoursInput: {
          backgroundColor: colors.neutral[50],
          borderWidth: 1,
          borderColor: colors.neutral[200],
          borderRadius: 8,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          fontSize: 14,
          color: colors.onSurface,
          width: 60,
          textAlign: 'center',
        },
        hoursInputDisabled: {
          backgroundColor: colors.surfaceContainer,
          color: colors.neutral[400],
        },
        separator: {
          marginHorizontal: spacing.sm,
          color: colors.neutral[400],
          fontSize: 14,
        },
        logoutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          paddingVertical: spacing.md,
          marginTop: spacing.md,
          marginBottom: spacing.xl,
        },
        logoutText: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.error,
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Perfil" showBack={false} showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'R'}</Text>
          </View>
          <Text style={styles.profileName}>{user?.name ?? 'Restaurante'}</Text>
          <Text style={styles.profileRole}>Restaurante Parceiro</Text>
        </View>

        {/* Status */}
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Restaurante Aberto</Text>
            <Switch
              value={isOpen}
              onValueChange={setIsOpen}
              trackColor={{ false: colors.neutral[300], true: colors.primary[100] }}
              thumbColor={isOpen ? colors.primary[500] : colors.neutral[400]}
            />
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome do Restaurante</Text>
            <TextInput
              style={[styles.formInput, !editing && styles.formInputDisabled]}
              value={formName}
              onChangeText={setFormName}
              editable={editing}
              placeholder="Nome do restaurante"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Descrição</Text>
            <TextInput
              style={[styles.formInput, !editing && styles.formInputDisabled, { minHeight: 60 }]}
              value={formDescription}
              onChangeText={setFormDescription}
              editable={editing}
              placeholder="Descrição do restaurante"
              placeholderTextColor={colors.neutral[400]}
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Telefone</Text>
            <TextInput
              style={[styles.formInput, !editing && styles.formInputDisabled]}
              value={formPhone}
              onChangeText={setFormPhone}
              editable={editing}
              placeholder="+244 9XX XXX XXX"
              placeholderTextColor={colors.neutral[400]}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Taxa de Entrega (Kz)</Text>
              <TextInput
                style={[styles.formInput, !editing && styles.formInputDisabled]}
                value={formDeliveryFee}
                onChangeText={setFormDeliveryFee}
                editable={editing}
                placeholder="500"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.formLabel}>Tempo de Entrega</Text>
              <TextInput
                style={[styles.formInput, !editing && styles.formInputDisabled]}
                value={formDeliveryTime}
                onChangeText={setFormDeliveryTime}
                editable={editing}
                placeholder="30-45 min"
                placeholderTextColor={colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        {/* Opening Hours */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>
          {openingHours.map((hours, index) => (
            <View key={hours.day} style={styles.hoursRow}>
              <Text style={[styles.dayLabel, !hours.active && styles.dayLabelInactive]}>
                {DAYS_OF_WEEK[hours.day]}
              </Text>
              {editing ? (
                <>
                  <TextInput
                    style={[styles.hoursInput, !hours.active && styles.hoursInputDisabled]}
                    value={hours.open}
                    onChangeText={(text) =>
                      setOpeningHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, open: text } : h)),
                      )
                    }
                    editable={hours.active}
                    placeholder="08:00"
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <Text style={styles.separator}>às</Text>
                  <TextInput
                    style={[styles.hoursInput, !hours.active && styles.hoursInputDisabled]}
                    value={hours.close}
                    onChangeText={(text) =>
                      setOpeningHours((prev) =>
                        prev.map((h, i) => (i === index ? { ...h, close: text } : h)),
                      )
                    }
                    editable={hours.active}
                    placeholder="22:00"
                    placeholderTextColor={colors.neutral[400]}
                  />
                  <Switch
                    value={hours.active}
                    onValueChange={() => toggleDay(index)}
                    trackColor={{ false: colors.neutral[300], true: colors.primary[100] }}
                    thumbColor={hours.active ? colors.primary[500] : colors.neutral[400]}
                  />
                </>
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: hours.active ? colors.onSurface : colors.neutral[400],
                  }}
                >
                  {hours.active ? `${hours.open} - ${hours.close}` : 'Fechado'}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {editing ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Button title="Cancelar" onPress={() => setEditing(false)} variant="ghost" />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={saving ? 'Salvando...' : 'Salvar'}
                onPress={handleSave}
                disabled={saving}
                loading={saving}
              />
            </View>
          </View>
        ) : (
          <Button title="Editar Perfil" onPress={() => setEditing(true)} variant="secondary" />
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutConfirm(true)}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sair da conta"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </SafeAreaView>
  );
}
