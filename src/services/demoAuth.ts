import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

// Names retained for existing imports. All sessions are now server-authenticated.
export type DemoRole = 'client' | 'delivery' | 'restaurant';
export type DemoSession = { token: string; refreshToken?: string; user: User; role: DemoRole };
const SESSION_KEY = 'pedeja.session.v2';
const listeners = new Set<(session: DemoSession | null) => void>();
let memorySession: DemoSession | null = null;
let loaded = false;
let generation = 0;
let persistence: Promise<unknown> = Promise.resolve();

export function roleFromUser(user: User): DemoRole {
  switch (user?.role) {
    case 'cliente': return 'client';
    case 'entregador': return 'delivery';
    case 'restaurante': return 'restaurant';
    default: throw new Error('Este perfil não tem acesso à aplicação mobile.');
  }
}

export function validateSession(value: unknown): DemoSession {
  const session = value as DemoSession;
  if (!session || typeof session.token !== 'string' || !session.token.trim() ||
      typeof session.user?.id !== 'string' || !session.user.id ||
      typeof session.user.name !== 'string' ||
      (session.refreshToken !== undefined && typeof session.refreshToken !== 'string')) {
    throw new Error('Resposta de autenticação inválida.');
  }
  return { ...session, role: roleFromUser(session.user) };
}

export function onSessionChange(listener: (session: DemoSession | null) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export async function loadDemoSession(): Promise<DemoSession | null> {
  if (loaded) return memorySession;
  const version = generation;
  // Never migrate plaintext tokens. Existing installations must authenticate again.
  await AsyncStorage.multiRemove(['authToken', 'user', 'sessionRole', 'activeVoipCall']);
  const raw = Platform.OS === 'web' ? null : await SecureStore.getItemAsync(SESSION_KEY);
  if (generation !== version) return memorySession;
  try {
    memorySession = raw ? validateSession(JSON.parse(raw)) : null;
  } catch {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
    memorySession = null;
  }
  loaded = true;
  return memorySession;
}

export async function saveDemoSession(value: DemoSession): Promise<void> {
  const session = validateSession(value);
  const version = ++generation;
  const write = persistence.catch(() => undefined).then(async () => {
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }
    if (generation !== version) return;
    loaded = true;
    memorySession = session;
    listeners.forEach((listener) => listener(session));
  });
  persistence = write;
  await write;
}

export async function clearDemoSession(): Promise<void> {
  generation++;
  memorySession = null;
  loaded = true;
  listeners.forEach((listener) => listener(null));
  const clear = persistence.catch(() => undefined).then(async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
    await AsyncStorage.multiRemove(['authToken', 'user', 'sessionRole', 'activeVoipCall']);
  });
  persistence = clear;
  await clear;
}
