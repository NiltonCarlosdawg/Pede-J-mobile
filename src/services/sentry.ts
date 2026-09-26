import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN) && !__DEV__,
  sendDefaultPii: false,
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 0.0 : 0.2,
  profilesSampleRate: __DEV__ ? 0.0 : 0.1,
  enableAutoPerformanceTracing: true,
  enableWatchdogTerminationTracking: false,
  attachScreenshot: false,
  maxBreadcrumbs: 50,
  beforeSend: (event) => {
    if (__DEV__) return null;
    delete event.user;
    delete event.request;
    // HTTP errors can contain credentials, messages and payment payloads.
    delete event.extra;
    event.breadcrumbs = event.breadcrumbs
      ?.filter((item) => item.category !== 'console')
      .map((item) => ({ ...item, data: undefined }));
    return event;
  },
});

export function trackApiError(
  endpoint: string,
  status: number,
  message?: string,
  extras?: Record<string, unknown>,
) {
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${endpoint} returned ${status}`,
    level: 'error',
    data: { status, message, ...extras },
  });
}

export function trackScreenView(screenName: string) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Screen: ${screenName}`,
    level: 'info',
  });
}

export function trackPerformance(
  operation: string,
  durationMs: number,
  extras?: Record<string, unknown>,
) {
  if (durationMs > 2000) {
    Sentry.captureMessage(`Slow operation: ${operation} (${durationMs}ms)`, {
      level: 'warning',
      extra: { durationMs, ...extras },
    });
  }
}

export default Sentry;
