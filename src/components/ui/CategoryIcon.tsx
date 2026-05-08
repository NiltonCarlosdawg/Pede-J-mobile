import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
}

// Map category names to Ionicons or MaterialCommunityIcons icon names
const iconMap: Record<
  string,
  { lib: "Ionicons" | "MaterialCommunityIcons"; name: string }
> = {
  Todas: { lib: "Ionicons", name: "fast-food-outline" },
  Pizza: { lib: "Ionicons", name: "pizza-outline" },
  Hambúrguer: { lib: "Ionicons", name: "fast-food-outline" },
  Angolana: { lib: "MaterialCommunityIcons", name: "fish" },
  Asiática: { lib: "Ionicons", name: "restaurant-outline" },
};

export const CategoryIcon = ({
  name,
  size = 24,
  color = "#292929",
}: CategoryIconProps) => {
  const icon = iconMap[name] || iconMap["Todas"];
  if (icon.lib === "Ionicons") {
    return (
      <Ionicons
        name={icon.name as React.ComponentProps<typeof Ionicons>["name"]}
        size={size}
        color={color}
      />
    );
  }
  return (
    <MaterialCommunityIcons
      name={icon.name as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
      size={size}
      color={color}
    />
  );
};
