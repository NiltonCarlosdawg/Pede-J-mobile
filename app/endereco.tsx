import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { useAddAddressMutation, useGetAddressesQuery } from '../src/hooks/useApi';
import { Header } from '../src/components/ui/Header';
import { spacing, typography } from '../src/theme';
import { useTheme } from '../src/hooks/useTheme';
import type { Address } from '../src/types';
import { Button } from '../src/components/ui/Button';

const ROW_HIT_SLOP = { top: 12, bottom: 12, left: 8, right: 8 };

export default function AddressScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    data: apiAddresses,
    isFetching,
    isError,
    refetch,
  } = useGetAddressesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const addresses: Address[] = useMemo(() => {
    if (Array.isArray(apiAddresses)) return apiAddresses as unknown as Address[];
    if (Array.isArray((apiAddresses as any)?.data)) return (apiAddresses as any).data as Address[];
    return [];
  }, [apiAddresses]);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addAddress] = useAddAddressMutation();
  const [formLabel, setFormLabel] = useState('Casa');
  const [formAddress, setFormAddress] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('Luanda');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formDefault, setFormDefault] = useState(false);

  const resetForm = useCallback(() => {
    setFormLabel('Casa');
    setFormAddress('');
    setFormNeighborhood('');
    setFormCity('Luanda');
    setFormLat('');
    setFormLng('');
    setFormDefault(addresses.length === 0);
  }, [addresses.length]);

  const handleUseLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Permite o acesso à localização para preencher coordenadas.',
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setFormLat(String(loc.coords.latitude));
      setFormLng(String(loc.coords.longitude));
    } catch {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!formAddress.trim() || !formNeighborhood.trim() || !formCity.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha endereço, bairro e cidade.');
      return;
    }
    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      Alert.alert(
        'Coordenadas',
        "Preencha latitude e longitude válidas (use 'Usar minha localização').",
      );
      return;
    }
    setSaving(true);
    try {
      await addAddress({
        label: formLabel.trim() || 'Casa',
        address: formAddress.trim(),
        neighborhood: formNeighborhood.trim(),
        city: formCity.trim(),
        latitude: lat,
        longitude: lng,
        isDefault: formDefault || addresses.length === 0,
      }).unwrap();
      setShowAdd(false);
      resetForm();
      // O invalidatesTags da mutation já dispara o refetch de getAddresses.
    } catch (err) {
      const message = (err as { data?: { message?: string | string[] } })?.data?.message;
      const detail = Array.isArray(message) ? message.join('\n') : message;
      Alert.alert('Erro ao gravar', detail || 'Não foi possível gravar o endereço na API real.');
    } finally {
      setSaving(false);
    }
  }, [
    formLabel,
    formAddress,
    formNeighborhood,
    formCity,
    formLat,
    formLng,
    formDefault,
    addresses.length,
    addAddress,
    resetForm,
  ]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          flex: 1,
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.lg,
        },
        title: {
          ...typography.h2,
          color: colors.onBackground,
          marginBottom: spacing.lg,
        },
        loadingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        },
        loadingText: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        addressesList: {
          gap: spacing.md,
          paddingBottom: spacing.xxl,
        },
        addressCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 16,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          minHeight: 52,
        },
        defaultAddress: {
          borderColor: colors.primary[500],
          borderWidth: 2,
        },
        addressIcon: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.surfaceContainer,
          alignItems: 'center',
          justifyContent: 'center',
        },
        addressInfo: {
          flex: 1,
        },
        addressRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: 4,
        },
        addressLabel: {
          ...typography.labelLg,
          color: colors.onSurface,
        },
        defaultBadge: {
          backgroundColor: colors.primary[100],
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
        },
        defaultText: {
          ...typography.labelCaps,
          color: colors.primary[500],
        },
        addressText: {
          ...typography.bodySm,
          color: colors.onSurface,
        },
        neighborhoodText: {
          ...typography.bodySm,
          color: colors.neutral[500],
        },
        addButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.primary[500],
          borderStyle: 'dashed',
          marginTop: spacing.md,
          minHeight: 48,
        },
        addButtonText: {
          ...typography.labelLg,
          color: colors.primary[500],
        },
        offlineHint: {
          ...typography.bodySm,
          color: colors.neutral[600],
          marginBottom: spacing.md,
        },
      }),
    [colors],
  );

  function iconForLabel(label: string): 'home' | 'briefcase' | 'map-marker' {
    if (label === 'Casa') return 'home';
    if (label === 'Trabalho') return 'briefcase';
    return 'map-marker';
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header showBack />

      <View style={styles.content}>
        <Text style={styles.title}>Meus Endereços</Text>

        {isFetching ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary[500]} />
            <Text style={styles.loadingText}>A carregar endereços da API…</Text>
          </View>
        ) : null}
        {isError ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              marginBottom: spacing.md,
            }}
          >
            <Text style={[styles.offlineHint, { flex: 1, color: colors.error }]}>
              Falha ao carregar endereços da API (PostgreSQL).
            </Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={{ color: colors.primary[500], fontWeight: '700' }}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {!isFetching && !isError && addresses.length === 0 ? (
          <View style={{ alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <MaterialCommunityIcons name="map-marker-off" size={32} color={colors.neutral[400]} />
            <Text style={[styles.offlineHint, { textAlign: 'center' }]}>
              Nenhum endereço cadastrado ainda. Os endereços vêm do banco (POST /users/me/addresses)
              — sem dados mock.
            </Text>
          </View>
        ) : null}

        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.addressesList}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: addr }) => (
            <TouchableOpacity
              style={[styles.addressCard, addr.isDefault && styles.defaultAddress]}
              onPress={() => router.back()}
              activeOpacity={0.85}
              hitSlop={ROW_HIT_SLOP}
            >
              <View style={styles.addressIcon}>
                <MaterialCommunityIcons
                  name={iconForLabel(addr.label)}
                  size={24}
                  color={addr.isDefault ? colors.primary[500] : colors.neutral[500]}
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isDefault ? (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Principal</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                <Text style={styles.neighborhoodText}>
                  {addr.neighborhood}, {addr.city}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.neutral[300]} />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.85}
              hitSlop={ROW_HIT_SLOP}
              onPress={() => {
                resetForm();
                setShowAdd(true);
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.primary[500]} />
              <Text style={styles.addButtonText}>Adicionar novo endereço</Text>
            </TouchableOpacity>
          }
        />

        <Modal
          visible={showAdd}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAdd(false)}
          statusBarTranslucent
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
            onPress={() => setShowAdd(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors.surfaceContainerLowest,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: spacing.lg,
                maxHeight: '90%',
              }}
              onPress={() => {}}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <Text style={{ ...typography.h3, color: colors.onSurface }}>
                  Novo endereço (API real)
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAdd(false)}
                  hitSlop={ROW_HIT_SLOP}
                  accessibilityLabel="Fechar modal"
                >
                  <MaterialCommunityIcons name="close" size={24} color={colors.neutral[500]} />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.lg }}
              >
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  {['Casa', 'Trabalho', 'Outro'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setFormLabel(opt)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: formLabel === opt ? colors.primary[500] : colors.neutral[200],
                        backgroundColor:
                          formLabel === opt ? colors.primary[500] : colors.surfaceContainer,
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          color: formLabel === opt ? colors.white : colors.neutral[700],
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View>
                  <Text
                    style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: 4 }}
                  >
                    Endereço *
                  </Text>
                  <TextInput
                    value={formAddress}
                    onChangeText={setFormAddress}
                    placeholder="Rua, nº, apto"
                    placeholderTextColor={colors.neutral[400]}
                    style={{
                      backgroundColor: colors.neutral[50],
                      borderWidth: 1,
                      borderColor: colors.neutral[200],
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.onSurface,
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: 4 }}
                  >
                    Bairro *
                  </Text>
                  <TextInput
                    value={formNeighborhood}
                    onChangeText={setFormNeighborhood}
                    placeholder="Ex: Maianga"
                    placeholderTextColor={colors.neutral[400]}
                    style={{
                      backgroundColor: colors.neutral[50],
                      borderWidth: 1,
                      borderColor: colors.neutral[200],
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.onSurface,
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: 4 }}
                  >
                    Cidade *
                  </Text>
                  <TextInput
                    value={formCity}
                    onChangeText={setFormCity}
                    placeholder="Luanda"
                    placeholderTextColor={colors.neutral[400]}
                    style={{
                      backgroundColor: colors.neutral[50],
                      borderWidth: 1,
                      borderColor: colors.neutral[200],
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.onSurface,
                    }}
                  />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: 4 }}
                    >
                      Latitude *
                    </Text>
                    <TextInput
                      value={formLat}
                      onChangeText={setFormLat}
                      placeholder="-8.8390"
                      keyboardType="numeric"
                      placeholderTextColor={colors.neutral[400]}
                      style={{
                        backgroundColor: colors.neutral[50],
                        borderWidth: 1,
                        borderColor: colors.neutral[200],
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: colors.onSurface,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: 4 }}
                    >
                      Longitude *
                    </Text>
                    <TextInput
                      value={formLng}
                      onChangeText={setFormLng}
                      placeholder="13.2894"
                      keyboardType="numeric"
                      placeholderTextColor={colors.neutral[400]}
                      style={{
                        backgroundColor: colors.neutral[50],
                        borderWidth: 1,
                        borderColor: colors.neutral[200],
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: colors.onSurface,
                      }}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleUseLocation}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}
                >
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={18}
                    color={colors.primary[500]}
                  />
                  <Text style={{ color: colors.primary[500], fontWeight: '700' }}>
                    Usar minha localização
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setFormDefault((v) => !v)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: formDefault ? colors.primary[500] : colors.neutral[300],
                      backgroundColor: formDefault ? colors.primary[500] : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {formDefault ? (
                      <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                    ) : null}
                  </TouchableOpacity>
                  <Text style={{ color: colors.neutral[700] }}>Definir como principal</Text>
                </View>

                <Button
                  title={saving ? 'A gravar...' : 'Gravar na API'}
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                />
                <Text
                  style={{ ...typography.bodySm, color: colors.neutral[500], textAlign: 'center' }}
                >
                  POST /users/me/addresses → Postgres (sem mock)
                </Text>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
