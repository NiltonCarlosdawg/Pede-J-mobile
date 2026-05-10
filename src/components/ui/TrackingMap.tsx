import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";

import { useTheme } from "../../hooks/useTheme";
import type { Coordinates } from "../../services/location";

interface TrackingMapProps {
  restaurantLocation: Coordinates;
  customerLocation: Coordinates;
  driverLocation: Coordinates;
  showUserLocation?: boolean;
}

export function TrackingMap({
  restaurantLocation,
  customerLocation,
  driverLocation,
  showUserLocation = true,
}: TrackingMapProps) {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: (restaurantLocation.latitude + customerLocation.latitude) / 2,
    longitude: (restaurantLocation.longitude + customerLocation.longitude) / 2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Request location permission and get current location
  useEffect(() => {
    if (!showUserLocation || Platform.OS === "web") return;

    let locationSubscription: Location.LocationSubscription;

    const setupLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setHasLocationPermission(true);
        
        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Watch location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      }
    };

    setupLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [showUserLocation]);

  // Fit map to show all markers
  useEffect(() => {
    const locations = [restaurantLocation, customerLocation, driverLocation];
    if (userLocation) locations.push(userLocation);

    const latitudes = locations.map((l) => l.latitude);
    const longitudes = locations.map((l) => l.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const padding = 0.01;
    const newRegion = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) + padding * 2),
      longitudeDelta: Math.max(0.02, (maxLon - minLon) + padding * 2),
    };

    setRegion(newRegion);

    setTimeout(() => {
      mapRef.current?.animateToRegion(newRegion, 1000);
    }, 500);
  }, [restaurantLocation, customerLocation, driverLocation, userLocation]);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={true}
        rotateEnabled={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Você está aqui">
            <View style={[styles.userMarker, { borderColor: colors.primary[500] }]}>
              <View style={[styles.userDot, { backgroundColor: colors.primary[500] }]} />
            </View>
          </Marker>
        )}

        {/* Restaurant marker */}
        <Marker coordinate={restaurantLocation} title="Restaurante">
          <View style={[styles.markerContainer, { backgroundColor: colors.secondary[500] }]}>
            <MaterialCommunityIcons name="store" size={12} color={colors.white} />
          </View>
        </Marker>

        {/* Customer marker */}
        <Marker coordinate={customerLocation} title="Cliente">
          <View style={[styles.markerContainer, { backgroundColor: colors.primary[500] }]}>
            <MaterialCommunityIcons name="home" size={12} color={colors.white} />
          </View>
        </Marker>

        {/* Driver marker */}
        <Marker coordinate={driverLocation} title="Entregador">
          <View style={[styles.driverMarker, { borderColor: colors.primary[500] }]}>
            <MaterialCommunityIcons name="moped" size={16} color={colors.primary[500]} />
          </View>
        </Marker>
      </MapView>

      {/* My Location button */}
      {hasLocationPermission && (
        <TouchableOpacity
          style={[styles.myLocationButton, { backgroundColor: colors.white }]}
          onPress={centerOnUser}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color={colors.primary[500]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
