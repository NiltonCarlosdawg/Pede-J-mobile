import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.neutral[200],
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
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
    </Tabs>
  );
}