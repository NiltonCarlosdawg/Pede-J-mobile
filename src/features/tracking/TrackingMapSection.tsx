import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrackingMap } from '../../components/ui/TrackingMap';
import { useTheme } from '../../hooks/useTheme';
import type { Coordinates } from '../../services/location';

interface TrackingMapSectionProps {
  hasRoute: boolean;
  restaurantLocation: Coordinates | null;
  customerLocation: Coordinates | null;
  driverLocation: Coordinates | null;
}

export function TrackingMapSection({
  hasRoute,
  restaurantLocation,
  customerLocation,
  driverLocation,
}: TrackingMapSectionProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        mapContainer: {
          height: 300,
          position: 'relative',
        },
      }),
    [],
  );

  return (
    <View style={styles.mapContainer}>
      {hasRoute && driverLocation ? (
        <TrackingMap
          restaurantLocation={restaurantLocation!}
          customerLocation={customerLocation!}
          driverLocation={driverLocation}
        />
      ) : hasRoute ? (
        <TrackingMap
          restaurantLocation={restaurantLocation!}
          customerLocation={customerLocation!}
          driverLocation={restaurantLocation!}
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surfaceContainer,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="map-marker-off" size={32} color={colors.neutral[400]} />
          <Text style={{ color: colors.neutral[500], textAlign: 'center', paddingHorizontal: 24 }}>
            Rota indisponível — aguardando dados reais do restaurante e cliente no banco
            (origem/destino).
          </Text>
        </View>
      )}
    </View>
  );
}
