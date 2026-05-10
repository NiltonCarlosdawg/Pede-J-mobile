export interface NotificationData {
  type: "order" | "delivery" | "promotion" | "system";
  orderId?: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export function configureNotificationHandler() {
  // no-op on web
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function setupAndroidNotificationChannel() {
  // no-op on web
}

export async function scheduleLocalNotification(
  _title: string,
  _body: string,
  _data?: Record<string, any>,
  _delaySeconds: number = 0
) {
  // no-op on web
}

export async function notifyOrderConfirmed(_orderId: string, _restaurantName: string) {
  // no-op on web
}

export async function notifyDriverOnTheWay(_orderId: string, _driverName: string) {
  // no-op on web
}

export async function notifyOrderDelivered(_orderId: string) {
  // no-op on web
}

export async function notifyPromotion(_title: string, _body: string, _code?: string) {
  // no-op on web
}

export async function cancelAllNotifications() {
  // no-op on web
}

export async function getPushToken(): Promise<string | null> {
  return null;
}

export async function dismissAllNotifications() {
  // no-op on web
}

export async function initializeNotifications() {
  return false;
}

export function setupNotificationListener(_callback: (notification: any) => void): () => void {
  return () => {};
}
