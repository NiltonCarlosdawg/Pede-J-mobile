import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppSelector } from '../../src/store';

function DeliveryHeader() {
  const { colors } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  return (
    <View
      style={{
        backgroundColor: colors.secondary[500],
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <MaterialCommunityIcons name="motorbike" size={20} color={colors.white} />
      <Text style={{ color: colors.white, fontWeight: '800' }}>ENTREGADOR</Text>
      <Text style={{ color: colors.white, opacity: 0.9, flex: 1 }} numberOfLines={1}>
        · {user?.name ?? 'Modo Entrega'}
      </Text>
      <View
        style={{
          backgroundColor: colors.white,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.secondary[700], fontWeight: '700', fontSize: 11 }}>
          PAINEL ENTREGADOR
        </Text>
      </View>
    </View>
  );
}

export default function DeliveryLayout() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DeliveryHeader />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="delivery-detail" options={{ headerShown: false }} />
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
        <Stack.Screen name="historico" options={{ headerShown: false }} />
        <Stack.Screen name="ganhos" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
