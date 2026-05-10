import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppSelector } from "../../store";
import { selectUnreadCount } from "../../store/notificationsSlice";
import { useTheme } from "../../hooks/useTheme";

interface NotificationBellProps {
  size?: number;
}

export function NotificationBell({ size = 24 }: NotificationBellProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const unreadCount = useAppSelector(selectUnreadCount);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: "relative",
      padding: 4,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    badgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "800",
      lineHeight: 14,
    },
  }), [colors]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/notifications")}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="bell-outline"
        size={size}
        color={colors.onSurface}
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
