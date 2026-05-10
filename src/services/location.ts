import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Solicita permissões de localização
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Obtém a localização atual do usuário
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

/**
 * Calcula a distância entre duas coordenadas (em km)
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(coord2.latitude - coord1.latitude);
  const dLon = deg2rad(coord2.longitude - coord1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.latitude)) *
      Math.cos(deg2rad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estima o tempo de entrega baseado na distância (assumindo 30km/h média)
 */
export function estimateDeliveryTime(distanceKm: number): number {
  const speedKmh = 30;
  const timeHours = distanceKm / speedKmh;
  return Math.ceil(timeHours * 60); // retorna minutos
}

/**
 * Coordenadas mock para Luanda
 */
export const MOCK_COORDINATES: Record<string, Coordinates> = {
  // Centro de Luanda
  center: { latitude: -8.8147, longitude: 13.2302 },
  // Mutamba
  mutamba: { latitude: -8.8167, longitude: 13.2322 },
  // Maianga
  maianga: { latitude: -8.8127, longitude: 13.2282 },
  // Ingombota
  ingombota: { latitude: -8.8107, longitude: 13.2342 },
  // Talatona
  talatona: { latitude: -8.9187, longitude: 13.1802 },
  // Vila Alice
  vilaAlice: { latitude: -8.8207, longitude: 13.2362 },
};

/**
 * Simula movimento do entregador entre dois pontos
 */
export function simulateDriverMovement(
  from: Coordinates,
  to: Coordinates,
  progress: number // 0 a 1
): Coordinates {
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * progress,
    longitude: from.longitude + (to.longitude - from.longitude) * progress,
  };
}
