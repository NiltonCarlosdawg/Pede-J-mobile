import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { apiSlice } from '../services/apiSlice';
import { useAppDispatch } from '../store';
import { publishDriverLocation, validCoordinates } from '../services/realtime';
import { safeGetItem } from '../utils/storage';

const SHARING_KEY = 'locationSharingEnabled';
const BACKGROUND_TASK = 'pedeja.driver-location';
let taskDefined = false;
function ensureTask() {
  if (taskDefined) return;
  taskDefined = true;
  TaskManager.defineTask(BACKGROUND_TASK, async ({ data, error }) => {
    if (error) {
      console.warn('[location] background error', error);
      return;
    }
    const locations = (data as { locations?: { coords: { latitude: number; longitude: number; heading: number | null } }[] })?.locations;
    const coords = locations?.[0]?.coords;
    if (!coords || !validCoordinates(coords)) return;
    const orderId = (globalThis as unknown as { __pedejaActiveOrderId?: string }).__pedejaActiveOrderId;
    if (!orderId) return;
    try {
      await publishDriverLocation({ orderId, latitude: coords.latitude, longitude: coords.longitude, heading: coords.heading ?? undefined });
    } catch {}
  });
}

/**
 * Enquanto o entregador tiver partilha activa e um pedido activo,
 * publica coordenadas via WebSocket (location:update).
 */
export function useDriverLocationPublisher(activeOrderId?: string | null) {
  const dispatch = useAppDispatch();
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' || !activeOrderId || activeOrderId.startsWith('local-')) {
      (globalThis as unknown as { __pedejaActiveOrderId?: string }).__pedejaActiveOrderId = undefined;
      return;
    }
    (globalThis as unknown as { __pedejaActiveOrderId?: string }).__pedejaActiveOrderId = activeOrderId;
    let cancelled = false;
    let backgroundActive = false;

    (async () => {
      ensureTask();
      const enabled = (await safeGetItem(SHARING_KEY)) === '1';
      if (!enabled || cancelled) return;

      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.status !== 'granted' || cancelled) return;
      const background = await Location.requestBackgroundPermissionsAsync().catch(() => ({ status: 'denied' as const }));
      const canBackground = background.status === 'granted';

      try {
        await dispatch(apiSlice.endpoints.toggleLocationSharing.initiate(true)).unwrap();
      } catch (err) {
        console.warn('Failed to enable location sharing on server:', err);
      }
      if (cancelled) return;

      if (canBackground && Platform.OS !== 'android' && Platform.OS !== 'ios' ? false : canBackground) {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK).catch(() => false);
        if (!hasStarted) {
          await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 20,
            foregroundService: {
              notificationTitle: 'Entrega em curso',
              notificationBody: 'Partilha de localização activa para o cliente acompanhar.',
            },
          });
          backgroundActive = true;
        } else {
          backgroundActive = true;
        }
      }

      if (!backgroundActive) {
        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 8000,
            distanceInterval: 25,
          },
          (loc) => {
            if (!validCoordinates(loc.coords)) return;
            void publishDriverLocation({
              orderId: activeOrderId,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              heading: loc.coords.heading ?? undefined,
            }).catch((err: unknown) => console.warn('location publish failed:', err));
          }
        );
      }
    })();

    return () => {
      cancelled = true;
      (globalThis as unknown as { __pedejaActiveOrderId?: string }).__pedejaActiveOrderId = undefined;
      watchRef.current?.remove();
      watchRef.current = null;
      if (backgroundActive) {
        void Location.stopLocationUpdatesAsync(BACKGROUND_TASK).catch(() => undefined);
      }
    };
  }, [activeOrderId, dispatch]);
}

export { SHARING_KEY as LOCATION_SHARING_STORAGE_KEY };
