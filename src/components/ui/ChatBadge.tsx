import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppSelector } from "../../store";
import { selectHasUnreadChat } from "../../store/chatSlice";
import { useTheme } from "../../hooks/useTheme";

interface ChatBadgeProps {
  orderId?: string;
  size?: number;
}

export function ChatBadge({ orderId, size = 24 }: ChatBadgeProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const hasUnread = useAppSelector((state) =>
    orderId ? selectHasUnreadChat(state, orderId) : false
  );

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: "relative",
      padding: 4,
    },
    badge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.error,
      borderWidth: 2,
      borderColor: colors.background,
    },
  }), [colors]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/chat",
          params: orderId ? { orderId } : undefined,
        })
      }
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="chat-outline"
        size={size}
        color={colors.onSurface}
      />
      {hasUnread && <View style={styles.badge} />}
    </TouchableOpacity>
  );
}
