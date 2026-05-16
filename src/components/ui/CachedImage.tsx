import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageProps,
  StyleSheet,
  View,
} from "react-native";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  uri: string;
  fallbackIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconSize?: number;
}

export function CachedImage({
  uri,
  style,
  fallbackIcon = "image-off",
  iconSize = 24,
  ...rest
}: CachedImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <View style={[style, styles.container]}>
      {status === "loading" && (
        <View style={styles.overlay}>
          <ActivityIndicator size="small" />
        </View>
      )}
      <Image
        source={{ uri, cache: "force-cache" }}
        style={[style, status === "loading" && styles.hidden]}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...rest}
      />
      {status === "error" && (
        <View style={styles.overlay}>
          <MaterialCommunityIcons name={fallbackIcon} size={iconSize} color="#999" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", position: "relative" },
  hidden: { opacity: 0 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
});
