import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppSelector } from '../../src/store';

function RestaurantHeader() {
  const { colors } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  return (
    <View
      style={{
        backgroundColor: colors.onSurface,
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <MaterialCommunityIcons name="store" size={20} color={colors.white} />
      <Text style={{ color: colors.white, fontWeight: '800' }}>RESTAURANTE</Text>
      <Text style={{ color: colors.white, opacity: 0.9, flex: 1 }} numberOfLines={1}>
        · {user?.name ?? 'Gestão'}
      </Text>
      <View
        style={{
          backgroundColor: colors.primary[500],
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.white, fontWeight: '700', fontSize: 11 }}>GESTÃO</Text>
      </View>
    </View>
  );
}

export default function RestaurantLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <RestaurantHeader />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary[700],
          tabBarInactiveTintColor: colors.neutral[500],
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.neutral[100],
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
            borderTopWidth: 2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pedidos"
          options={{
            title: 'Pedidos',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="receipt" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cardapio"
          options={{
            title: 'Cardápio',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="store" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
