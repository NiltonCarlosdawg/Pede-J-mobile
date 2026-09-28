import { useEffect, useState } from 'react';
import { useGetOrderRouteQuery } from '../../hooks/useApi';
import { subscribeOrderLocation } from '../../services/realtime';
import { calculateDistance, estimateDeliveryTime, type Coordinates } from '../../services/location';
import type { Order } from '../../store/ordersSlice';
import type { OrderRoute } from '../../types';

export function useOrderTracking(selectedOrder: Order | null) {
  const [routeInfo, setRouteInfo] = useState<OrderRoute | null>(null);
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);

  const restaurantLocation: Coordinates | null = routeInfo?.origem ?? null;
  const customerLocation: Coordinates | null = routeInfo?.destino ?? null;
  const hasRoute = Boolean(restaurantLocation && customerLocation);

  // REST fallback: última posição persistida do entregador.
  // Fetch via RTK Query com o mesmo intervalo do antigo setInterval (8s).
  const routeOrderId = selectedOrder ? selectedOrder.id : '';
  const { data: routeData, isError: routeError } = useGetOrderRouteQuery(routeOrderId, {
    pollingInterval: 8000,
    skip: !routeOrderId,
  });

  useEffect(() => {
    if (!routeOrderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia a rota quando deixa de haver pedido rastreável
      setRouteInfo(null);
      return;
    }
    if (!routeData) return;
    setRouteInfo(routeData);
    if (routeData.lastKnown.latitude != null && routeData.lastKnown.longitude != null) {
      setDriverLocation({
        latitude: routeData.lastKnown.latitude,
        longitude: routeData.lastKnown.longitude,
      });
    } else if (routeData.origem) {
      setDriverLocation(routeData.origem);
    }
  }, [routeOrderId, routeData]);

  useEffect(() => {
    if (routeError) {
      console.warn('Failed to fetch order route:', routeError);
    }
  }, [routeError]);

  // Live updates via WebSocket quando disponíveis
  useEffect(() => {
    if (!selectedOrder) return;

    let unsubscribe: (() => void) | undefined;
    subscribeOrderLocation(selectedOrder.id, (payload) => {
      setDriverLocation({
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      setRouteInfo((prev) =>
        prev
          ? {
              ...prev,
              lastKnown: {
                ...prev.lastKnown,
                latitude: payload.latitude,
                longitude: payload.longitude,
                heading: payload.heading,
                timestamp: payload.timestamp,
              },
            }
          : prev,
      );
    })
      .then((fn) => {
        unsubscribe = fn;
      })
      .catch((err) => console.warn('WS location subscribe failed:', err));

    return () => unsubscribe?.();
    // selectedOrder é um objecto imutável do Redux: só muda de identidade quando o
    // pedido selecionado é alterado — o re-run apenas re-inscreve na mesma canal WS.
  }, [selectedOrder]);

  const hasRealLocation =
    routeInfo?.lastKnown.latitude != null && routeInfo?.lastKnown.longitude != null;
  const lastKnownAgeMs = hasRealLocation // eslint-disable-next-line react-hooks/purity -- a idade do lastKnown é amostrada do relógio em cada render; adiá-la para efeito/memo mudaria quando a idade é calculada
    ? Date.now() - new Date(routeInfo!.lastKnown.timestamp).getTime()
    : null;

  const distance =
    driverLocation && customerLocation ? calculateDistance(driverLocation, customerLocation) : null;
  const estimatedMinutes = distance != null ? estimateDeliveryTime(distance) : null;

  return {
    restaurantLocation,
    customerLocation,
    hasRoute,
    driverLocation,
    distance,
    estimatedMinutes,
    hasRealLocation,
    lastKnownAgeMs,
  };
}
