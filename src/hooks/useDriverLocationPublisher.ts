import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { deliveryApi } from '../services/api';
import { publishDriverLocation } from '../services/realtime';
import { safeGetItem } from '../utils/storage';

const SHARING_KEY = 'locationSharingEnabled';

/**
 * Enquanto o entregador tiver partilha activa e um pedido activo,
 * publica coordenadas via WebSocket (location:update).
 */
export function useDriverLocationPublisher(activeOrderId?: string | null) {
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || !activeOrderId || activeOrderId.startsWith('local-')) {
      return;
    }

    let cancelled = false;

    (async () => {
      const enabled = (await safeGetItem(SHARING_KEY)) === '1';
      if (!enabled || cancelled) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      try {
        await deliveryApi.toggleLocationSharing(true);
      } catch (err) {
        console.warn('Failed to enable location sharing on server:', err);
      }

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 8000,
          distanceInterval: 25,
        },
        (loc) => {
          void publishDriverLocation({
            orderId: activeOrderId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? undefined,
          }).catch((err: unknown) => console.warn('location publish failed:', err));
        }
      );
    })();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [activeOrderId]);
}

export { SHARING_KEY as LOCATION_SHARING_STORAGE_KEY };
