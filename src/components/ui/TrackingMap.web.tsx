import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "../../hooks/useTheme";
import type { Coordinates } from "../../services/location";
import { shadowStyle } from "../../utils/shadow";

interface TrackingMapProps {
  restaurantLocation: Coordinates;
  customerLocation: Coordinates;
  driverLocation: Coordinates;
  route?: Coordinates[];
  showUserLocation?: boolean;
}

export function TrackingMap({
  restaurantLocation,
  customerLocation,
  driverLocation,
}: TrackingMapProps) {
  const { colors } = useTheme();

  // Calculate relative position for driver (0-1)
  const latRange = customerLocation.latitude - restaurantLocation.latitude;
  const lonRange = customerLocation.longitude - restaurantLocation.longitude;
  const driverLatProgress = latRange !== 0 
    ? (driverLocation.latitude - restaurantLocation.latitude) / latRange 
    : 0;
  const driverLonProgress = lonRange !== 0 
    ? (driverLocation.longitude - restaurantLocation.longitude) / lonRange 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.webMapContainer}>
        {/* Background grid simulating roads */}
        <View style={styles.webMapBackground}>
          <View style={[styles.webRoadV, { left: "30%" }]} />
          <View style={[styles.webRoadV, { left: "60%" }]} />
          <View style={[styles.webRoadH, { top: "25%" }]} />
          <View style={[styles.webRoadH, { top: "55%" }]} />
          <View style={[styles.webRoadH, { top: "80%" }]} />
        </View>

        {/* Restaurant marker */}
        <View style={[styles.webMarker, { left: "25%", top: "20%" }]}>
          <View style={[styles.webMarkerDot, { backgroundColor: colors.secondary[500] }]}>
            <MaterialCommunityIcons name="store" size={12} color={colors.white} />
          </View>
          <Text style={styles.webMarkerLabel}>Restaurante</Text>
        </View>

        {/* Customer marker */}
        <View style={[styles.webMarker, { left: "65%", top: "75%" }]}>
          <View style={[styles.webMarkerDot, { backgroundColor: colors.primary[500] }]}>
            <MaterialCommunityIcons name="home" size={12} color={colors.white} />
          </View>
          <Text style={styles.webMarkerLabel}>Você</Text>
        </View>

        {/* Driver marker */}
        <View
          style={[
            styles.webMarker,
            {
              left: `${25 + driverLatProgress * 40}%`,
              top: `${20 + driverLonProgress * 55}%`,
            },
          ]}
        >
          <View style={[styles.webDriverMarker, { borderColor: colors.primary[500] }]}>
            <MaterialCommunityIcons name="moped" size={14} color={colors.primary[500]} />
          </View>
          <Text style={styles.webMarkerLabel}>Entregador</Text>
        </View>

        {/* Web badge */}
        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>Mapa disponível no app</Text>
        </View>

        {/* My Location button - web placeholder */}
        <TouchableOpacity
          style={[styles.myLocationButton, { backgroundColor: colors.white }]}
          activeOpacity={0.8}
          onPress={() => {}}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  webMapContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#e8e8e8",
    overflow: "hidden",
  },
  webMapBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webRoadV: {
    position: "absolute",
    width: 8,
    height: "100%",
    backgroundColor: "white",
  },
  webRoadH: {
    position: "absolute",
    height: 8,
    width: "100%",
    backgroundColor: "white",
  },
  webMarker: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },
  webMarkerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    ...shadowStyle({ offsetY: 2, blur: 3, opacity: 0.2, elevation: 4 }),
  },
  webDriverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    ...shadowStyle({ offsetY: 2, blur: 4, opacity: 0.25, elevation: 5 }),
  },
  webMarkerLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  webBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  webBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
  myLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle({ offsetY: 2, blur: 4, opacity: 0.2, elevation: 5 }),
  },
});
