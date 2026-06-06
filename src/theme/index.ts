import { sharedShadows } from "../utils/shadow";

export const lightColors = {
  primary: {
    700: "#C44A0B",
    600: "#E04E0A",
    500: "#f95a0d",
    400: "#FF7A3A",
    100: "#FFF0E8",
    50: "#FFF8F5",
  },
  secondary: {
    700: "#C88A0F",
    600: "#E89A10",
    500: "#fbac1d",
    400: "#FFC04D",
    100: "#FFF5E0",
    50: "#FFFBF0",
  },
  neutral: {
    900: "#292929",
    700: "#4A4A4A",
    500: "#8A8A8A",
    300: "#D4D4D4",
    200: "#E8E8E8",
    100: "#F5F5F5",
    50: "#FAFAFA",
    600: "#6A6A6A",
    400: "#B0B0B0",
  },
  background: "#ffffff",
  surface: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainer: "#f5f5f5",
  surfaceContainerHigh: "#eeeeee",
  surfaceContainerHighet: "#e8e8e8",
  surfaceVariant: "#e8e8e8",
  onSurface: "#292929",
  onSurfaceVariant: "#5b4137",
  onBackground: "#292929",
  white: "#FFFFFF",
  error: "#BA1A1A",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
};

export const darkColors = {
  primary: {
    700: "#C44A0B",
    600: "#E04E0A",
    500: "#f95a0d",
    400: "#FF7A3A",
    100: "#4D2D1A",
    50: "#3D2212",
  },
  secondary: {
    700: "#C88A0F",
    600: "#E89A10",
    500: "#fbac1d",
    400: "#FFC04D",
    100: "#4D3D10",
    50: "#3D3010",
  },
  neutral: {
    900: "#FFFFFF",
    700: "#E0E0E0",
    600: "#A0A0A0",
    500: "#B0B0B0",
    400: "#909090",
    300: "#707070",
    200: "#505050",
    100: "#383838",
    50: "#2C2C2C",
  },
  background: "#121212",
  surface: "#1E1E1E",
  surfaceContainerLowest: "#1E1E1E",
  surfaceContainer: "#2C2C2C",
  surfaceContainerHigh: "#383838",
  surfaceContainerHighet: "#424242",
  surfaceVariant: "#424242",
  onSurface: "#FFFFFF",
  onSurfaceVariant: "#E0E0E0",
  onBackground: "#FFFFFF",
  white: "#FFFFFF",
  error: "#FF6B6B",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
};

export type ThemeColors = typeof lightColors;

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}

export const colors = lightColors;

const FONT = "Arvo";

export const typography = {
  h1: { fontFamily: FONT, fontSize: 32, fontWeight: "700" as const, lineHeight: 38.4 },
  h2: { fontFamily: FONT, fontSize: 24, fontWeight: "700" as const, lineHeight: 31.2 },
  h3: { fontFamily: FONT, fontSize: 20, fontWeight: "600" as const, lineHeight: 28 },
  bodyLg: { fontFamily: FONT, fontSize: 18, fontWeight: "400" as const, lineHeight: 27 },
  bodyMd: { fontFamily: FONT, fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodySm: { fontFamily: FONT, fontSize: 14, fontWeight: "400" as const, lineHeight: 19.6 },
  labelCaps: { fontFamily: FONT, fontSize: 12, fontWeight: "600" as const, lineHeight: 12, letterSpacing: 0.05 },
  labelLg: { fontFamily: FONT, fontSize: 14, fontWeight: "600" as const, lineHeight: 16.8 },
  priceDisplay: { fontFamily: FONT, fontSize: 20, fontWeight: "700" as const, lineHeight: 20 },
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

export const shadows = sharedShadows;

export const formatPrice = (value: number) => {
  return "Kz " + value.toLocaleString("pt-AO");
};
