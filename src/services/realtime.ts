import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';
import { loadDemoSession, onSessionChange } from './demoAuth';

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;
let socketToken: string | null = null;

export function disconnectRealtime() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
  socketToken = null;
  connectPromise = null;
}

onSessionChange((session) => {
  if (!session) disconnectRealtime();
  else if (socket && socketToken !== session.token) {
    socketToken = session.token;
    socket.auth = { token: session.token };
    socket.disconnect().connect();
  }
});

export async function getRealtimeSocket(): Promise<Socket> {
  const session = await loadDemoSession();
  if (!session) throw new Error('Sessão necessária.');
  if (socket?.connected && socketToken === session.token) return socket;
  if (connectPromise) return connectPromise;
  socketToken = session.token;
  if (!socket) socket = io(BASE_URL.replace(/\/v1\/?$/, ''), {
    auth: { token: session.token }, transports: ['websocket'], autoConnect: false,
    reconnection: true, reconnectionAttempts: 8, timeout: 10000,
  });
  const current = socket;
  current.auth = { token: session.token };
  const pending = new Promise<Socket>((resolve, reject) => {
    const cleanup = () => { clearTimeout(timer); current.off('connect', connected); current.off('connect_error', failed); };
    const connected = () => { cleanup(); resolve(current); };
    const failed = () => { cleanup(); reject(new Error('Ligação em tempo real indisponível.')); };
    const timer = setTimeout(failed, 12000);
    current.once('connect', connected);
    current.once('connect_error', failed);
    current.connect();
  });
  connectPromise = pending;
  try { return await pending; }
  finally { if (connectPromise === pending) connectPromise = null; }
}

export type LocationUpdate = { orderId: string; latitude: number; longitude: number; heading: number | null; timestamp: string };

export function validCoordinates(value: { latitude: number; longitude: number }) {
  return Number.isFinite(value.latitude) && Number.isFinite(value.longitude) &&
    Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
}

export async function subscribeOrderLocation(orderId: string, onUpdate: (payload: LocationUpdate) => void): Promise<() => void> {
  const current = await getRealtimeSocket();
  const subscribe = () => current.emit('order:subscribe', { orderId });
  const handler = (payload: LocationUpdate) => {
    if (payload?.orderId === orderId && validCoordinates(payload) && Number.isFinite(Date.parse(payload.timestamp))) onUpdate(payload);
  };
  current.on('connect', subscribe);
  current.on('location:update', handler);
  subscribe();
  return () => {
    current.off('connect', subscribe);
    current.off('location:update', handler);
    current.emit('order:unsubscribe', { orderId });
  };
}

export async function publishDriverLocation(payload: { orderId: string; latitude: number; longitude: number; heading?: number }): Promise<void> {
  if (!validCoordinates(payload)) throw new Error('Coordenadas inválidas.');
  const current = await getRealtimeSocket();
  current.volatile.emit('location:update', { ...payload, timestamp: new Date().toISOString() });
}
