import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import {
    markAllAsRead,
    markAsRead,
    removeNotification,
    selectNotifications,
    selectUnreadCount,
    type AppNotification,
} from "../src/store/notificationsSlice";
import { spacing } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";

function getNotificationIcon(type: AppNotification["type"]) {
  switch (type) {
    case "order":
      return "receipt";
    case "delivery":
      return "truck-delivery";
    case "promotion":
      return "tag";
    case "system":
      return "information";
    default:
      return "bell";
  }
}

function getNotificationColor(type: AppNotification["type"]) {
  switch (type) {
    case "order":
      return "#4CAF50";
    case "delivery":
      return "#2196F3";
    case "promotion":
      return "#fbac1d";
    case "system":
      return "#9E9E9E";
    default:
      return "#757575";
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `${diffDays} d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    headerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.neutral[500],
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    markAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    markAllText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary[500],
    },
    notificationItem: {
      flexDirection: "row",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      marginBottom: spacing.sm,
    },
    unreadItem: {
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[100],
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
      flex: 1,
      marginRight: spacing.sm,
    },
    notificationTime: {
      fontSize: 12,
      color: colors.neutral[500],
    },
    notificationBody: {
      fontSize: 14,
      color: colors.neutral[500],
      lineHeight: 20,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary[500],
      marginTop: 6,
    },
    deleteButton: {
      padding: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxl,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.onSurface,
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
      marginTop: spacing.sm,
    },
  }), [colors]);

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="Notificações" showBack />
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="bell-off-outline"
            size={64}
            color={colors.neutral[300]}
          />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>
            Você receberá notificações sobre seus pedidos aqui.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Notificações" showBack showNotifications={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.headerActions}>
          <Text style={styles.headerTitle}>
            {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={() => dispatch(markAllAsRead())}
            >
              <MaterialCommunityIcons
                name="check-all"
                size={18}
                color={colors.primary[500]}
              />
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.map((notification) => {
          const icon = getNotificationIcon(notification.type);
          const iconColor = getNotificationColor(notification.type);

          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadItem,
              ]}
              onPress={() => {
                dispatch(markAsRead(notification.id));
                if (notification.data?.orderId) {
                  router.push("/(tabs)/rastreamento");
                }
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: iconColor + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={24}
                  color={iconColor}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTime(notification.createdAt)}
                  </Text>
                </View>
                <Text style={styles.notificationBody}>
                  {notification.body}
                </Text>
              </View>

              {!notification.read && <View style={styles.unreadDot} />}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => dispatch(removeNotification(notification.id))}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color={colors.neutral[400]}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
