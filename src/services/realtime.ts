import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';
import { safeGetItem } from '../utils/storage';

/** Socket.IO base URL (sem o prefixo /v1 da REST API). */
function wsBaseUrl() {
  return BASE_URL.replace(/\/v1\/?$/, '');
}

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

export async function getRealtimeSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const token = await safeGetItem('authToken');
    if (!token) {
      throw new Error('Sem token de autenticação para WebSocket');
    }

    if (socket) {
      socket.auth = { token };
      if (!socket.connected) socket.connect();
      return socket;
    }

    socket = io(wsBaseUrl(), {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 8,
    });

    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        socket?.off('connect', onConnect);
        socket?.off('connect_error', onError);
      };
      socket!.once('connect', onConnect);
      socket!.once('connect_error', onError);
    });

    return socket!;
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function disconnectRealtime() {
  socket?.disconnect();
  socket = null;
  connectPromise = null;
}

export async function subscribeOrderLocation(
  orderId: string,
  onUpdate: (payload: {
    orderId: string;
    latitude: number;
    longitude: number;
    heading: number | null;
    timestamp: string;
  }) => void
): Promise<() => void> {
  const s = await getRealtimeSocket();
  s.emit('location:subscribe', { orderId });
  s.emit('order:subscribe', { orderId });

  const handler = (payload: {
    orderId: string;
    latitude: number;
    longitude: number;
    heading: number | null;
    timestamp: string;
  }) => {
    if (payload.orderId === orderId) onUpdate(payload);
  };
  s.on('location:update', handler);

  return () => {
    s.off('location:update', handler);
    s.emit('order:unsubscribe', { orderId });
  };
}

export async function publishDriverLocation(payload: {
  orderId: string;
  latitude: number;
  longitude: number;
  heading?: number;
}): Promise<void> {
  const s = await getRealtimeSocket();
  s.emit('location:update', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}
