import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

export interface NotificationData {
  type: "order" | "delivery" | "promotion" | "system";
  orderId?: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const NOTIFICATION_CHANNEL_ID = "pedeja-notifications";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function configureNotificationHandler() {
  if (isExpoGo) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function setupAndroidNotificationChannel() {
  if (isExpoGo) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: "PedeJá Notificações",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#f95a0d",
    });
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  delaySeconds: number = 0
) {
  if (isExpoGo) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: delaySeconds > 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date() },
  });
}

export async function notifyOrderConfirmed(orderId: string, restaurantName: string) {
  await scheduleLocalNotification(
    "Pedido Confirmado!",
    `Seu pedido em ${restaurantName} foi confirmado e está sendo preparado.`,
    { type: "order", orderId, status: "confirmed" }
  );
}

export async function notifyDriverOnTheWay(orderId: string, driverName: string) {
  await scheduleLocalNotification(
    "Entregador a caminho!",
    `${driverName} está a caminho com seu pedido.`,
    { type: "delivery", orderId, status: "delivering" }
  );
}

export async function notifyOrderDelivered(orderId: string) {
  await scheduleLocalNotification(
    "Pedido Entregue!",
    "Seu pedido foi entregue. Bom apetite!",
    { type: "order", orderId, status: "delivered" }
  );
}

export async function notifyPromotion(title: string, body: string, code?: string) {
  await scheduleLocalNotification(
    title,
    body,
    { type: "promotion", code }
  );
}

export async function cancelAllNotifications() {
  if (isExpoGo) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getPushToken(): Promise<string | null> {
  if (isExpoGo) return null;

  const { data } = await Notifications.getExpoPushTokenAsync();
  return data ?? null;
}

export async function dismissAllNotifications() {
  if (isExpoGo) return;

  await Notifications.dismissAllNotificationsAsync();
}

export async function initializeNotifications() {
  configureNotificationHandler();
  await setupAndroidNotificationChannel();
  const granted = await requestNotificationPermissions();
  return granted;
}

/**
 * Configura listener de notificações recebidas
 * Retorna uma função de cleanup
 */
export function setupNotificationListener(callback: (notification: any) => void): () => void {
  if (isExpoGo) {
    return () => {};
  }

  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}
