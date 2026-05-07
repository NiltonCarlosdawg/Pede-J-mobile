import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://YOUR_SENTRY_DSN_HERE@o123456.ingest.sentry.io/1234567',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
});

export default Sentry;