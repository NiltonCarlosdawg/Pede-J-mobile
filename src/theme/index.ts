export const colors = {
  primary: {
    500: '#f95a0d',
    600: '#E04E0A',
    400: '#FF7A3A',
    100: '#FFF0E8',
  },
  secondary: {
    500: '#fbac1d',
    600: '#E89A10',
    400: '#FFC04D',
    100: '#FFF5E0',
  },
  neutral: {
    900: '#292929',
    700: '#4A4A4A',
    500: '#8A8A8A',
    300: '#D4D4D4',
    200: '#E8E8E8',
    100: '#F5F5F5',
    50: '#FAFAFA',
  },
  background: '#ffffff',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#f5f5f5',
  surfaceContainerHigh: '#eeeeee',
  surfaceContainerHighet: '#e8e8e8',
  surfaceVariant: '#e8e8e8',
  onSurface: '#292929',
  onSurfaceVariant: '#5b4137',
  onBackground: '#292929',
  white: '#FFFFFF',
  error: '#BA1A1A',
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38.4 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 31.2 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 27 },
  bodyMd: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 19.6 },
  labelCaps: { fontSize: 12, fontWeight: '600' as const, lineHeight: 12, letterSpacing: 0.05 },
  labelLg: { fontSize: 14, fontWeight: '600' as const, lineHeight: 16.8 },
  priceDisplay: { fontSize: 20, fontWeight: '700' as const, lineHeight: 20 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 16,
  containerMargin: 20,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
};

export const formatPrice = (value: number) => {
  return 'Kz ' + value.toLocaleString('pt-AO');
};