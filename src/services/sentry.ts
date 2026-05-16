import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://YOUR_SENTRY_DSN_HERE@o123456.ingest.sentry.io/1234567',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: __DEV__ ? 0.0 : 0.2,
  profilesSampleRate: __DEV__ ? 0.0 : 0.1,
  enableAutoPerformanceTracing: true,
  enableWatchdogTerminationTracking: false,
  attachScreenshot: false,
  maxBreadcrumbs: 50,
  beforeSend: (event) => {
    if (__DEV__) return null;
    return event;
  },
});

export function trackApiError(
  endpoint: string,
  status: number,
  message?: string,
  extras?: Record<string, unknown>
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
  extras?: Record<string, unknown>
) {
  if (durationMs > 2000) {
    Sentry.captureMessage(`Slow operation: ${operation} (${durationMs}ms)`, {
      level: 'warning',
      extra: { durationMs, ...extras },
    });
  }
}

export default Sentry;