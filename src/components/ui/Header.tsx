import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme";

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
  avatarUrl
}: HeaderProps) {
  const router = useRouter() as any;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
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
            <Text style={styles.address} numberOfLines={1}>
              {address}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-down" 
              size={18} 
              color={colors.primary[500]} 
            />
          </TouchableOpacity>
        ) : (
          title && <Text style={styles.title}>{title}</Text>
        )}
      </View>

      <View style={styles.rightSection}>
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
            <View style={styles.cartDot}>
              <Text style={styles.cartDotText}>{cartItems}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.avatarButton}
          onPress={() => router.push('/perfil')}
        >
          <MaterialCommunityIcons 
            name="account-circle" 
            size={36} 
            color={colors.neutral[300]} 
          />
        </TouchableOpacity>
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
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
    color: colors.neutral[900],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
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
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  avatarButton: {
    padding: spacing.xs,
  },
});