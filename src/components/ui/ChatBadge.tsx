import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useAppSelector } from "../../store";
import { selectHasUnreadChat } from "../../store/chatSlice";
import { useTheme } from "../../hooks/useTheme";
import { orderApi } from "../../services/api";

interface ChatBadgeProps {
  orderId?: string;
  size?: number;
}

export function ChatBadge({ orderId, size = 24 }: ChatBadgeProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const localUnread = useAppSelector((state) =>
    orderId ? selectHasUnreadChat(state, orderId) : false
  );
  const [remoteUnread, setRemoteUnread] = useState(0);

  useEffect(() => {
    if (!orderId || orderId.startsWith("local-")) {
      setRemoteUnread(0);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await orderApi.getUnreadMessages(orderId);
        if (!cancelled) setRemoteUnread(Number(data.unreadCount ?? 0));
      } catch {
        // Mantém badge local se a API falhar.
      }
    };

    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId]);

  const hasUnread = remoteUnread > 0 || localUnread;

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
