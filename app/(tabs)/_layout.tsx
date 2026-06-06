import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  const tabBarStyle = useMemo(() => ({
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  }), [colors]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' as const },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="restaurantes"
        options={{
          title: 'Restaurantes',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="store" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rastreamento"
        options={{
          title: 'Acompanhar',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="moped" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}