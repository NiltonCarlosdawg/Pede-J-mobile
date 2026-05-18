import { Platform, type ViewStyle } from "react-native";

function withAlpha(color: string, opacity: number) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;

    if (normalized.length === 6) {
      const red = parseInt(normalized.slice(0, 2), 16);
      const green = parseInt(normalized.slice(2, 4), 16);
      const blue = parseInt(normalized.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
    }
  }

  return color;
}

export function shadowStyle({
  color = "#000",
  offsetX = 0,
  offsetY = 2,
  blur = 4,
  opacity = 0.2,
  elevation = 0,
}: {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  opacity?: number;
  elevation?: number;
} = {}): ViewStyle {
  if (Platform.OS === "web") {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${withAlpha(color, opacity)}`,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };
}

export const sharedShadows = {
  sm: shadowStyle({ offsetY: 1, blur: 2, opacity: 0.05, elevation: 1 }),
  md: shadowStyle({ offsetY: 4, blur: 6, opacity: 0.08, elevation: 3 }),
  lg: shadowStyle({ offsetY: 8, blur: 12, opacity: 0.12, elevation: 5 }),
};
