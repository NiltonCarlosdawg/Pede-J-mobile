import React from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../../theme";
import { useTheme } from "../../hooks/useTheme";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  showLocation?: boolean;
  address?: string;
  showCartBadge?: boolean;
  cartItems?: number;
  cartTotal?: string;
  showAvatar?: boolean;
  showLogo?: boolean;
  avatarUrl?: string;
  onBackPress?: () => void;
  showNotifications?: boolean;
}

export function Header({ 
  showBack = false, 
  title,
  showLocation = true,
  address = "Rua das Flores, Luanda",
  showCartBadge = false,
  cartItems = 0,
  cartTotal = "Kz 0",
  showAvatar = true,
  showLogo = false,
  avatarUrl,
  onBackPress,
  showNotifications = true,
}: HeaderProps) {
  const router = useRouter() as any;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0, backgroundColor: colors.surface, borderBottomColor: colors.neutral[100] }]}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBackPress || (() => router.back())}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={colors.onSurface} 
            />
          </TouchableOpacity>
        ) : showLocation ? (
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => router.push('/endereco')}
          >
            <MaterialCommunityIcons 
              name="map-marker" 
              size={20} 
              color={colors.primary[500]} 
            />
            <Text style={[styles.address, { color: colors.neutral[900] }]} numberOfLines={1}>
              {address}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={18} 
              color={colors.primary[500]} 
            />
          </TouchableOpacity>
        ) : (
          title && <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {showNotifications && <NotificationBell />}
        
        <TouchableOpacity 
          style={styles.cartIconButton}
          onPress={() => router.push('/carrinho')}
        >
          <MaterialCommunityIcons 
            name="cart" 
            size={24} 
            color={colors.primary[500]} 
          />
          {cartItems > 0 && (
            <View style={[styles.cartDot, { backgroundColor: colors.primary[500] }]}>
              <Text style={[styles.cartDotText, { color: colors.white }]}>{cartItems}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {showAvatar ? (
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/perfil')}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons
                name="account-circle"
                size={36}
                color={colors.primary[500]}
              />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 200,
  },
  address: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  cartIconButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  cartDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartDotText: {
    fontSize: 10,
    fontWeight: '700',
  },
  avatarButton: {
    padding: spacing.xs,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});