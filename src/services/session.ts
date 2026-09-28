import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

// Sessão persistida no SecureStore. Todos os tokens vêm da API (não há contas locais).
// 'restaurant' mantém-se apenas como tipo das rotas guardadas de app/(restaurant);
// roleFromUser rejeita esse perfil, porque o painel do restaurante é uma app separada.
export type SessionRole = 'client' | 'delivery' | 'restaurant';
export type Session = { token: string; refreshToken?: string; user: User; role: SessionRole };
const SESSION_KEY = 'pedeja.session.v2';
const listeners = new Set<(session: Session | null) => void>();
let memorySession: Session | null = null;
let loaded = false;
let generation = 0;
let persistence: Promise<unknown> = Promise.resolve();

export function roleFromUser(user: User): SessionRole {
  switch (user?.role) {
    case 'cliente':
      return 'client';
    case 'entregador':
      return 'delivery';
    case 'restaurante':
      throw new Error(
        'O painel do restaurante é uma aplicação separada. Entre com uma conta de cliente ou entregador.',
      );
    default:
      throw new Error('Este perfil não tem acesso à aplicação mobile.');
  }
}

export function validateSession(value: unknown): Session {
  const session = value as Session;
  if (
    !session ||
    typeof session.token !== 'string' ||
    !session.token.trim() ||
    typeof session.user?.id !== 'string' ||
    !session.user.id ||
    typeof session.user.name !== 'string' ||
    (session.refreshToken !== undefined && typeof session.refreshToken !== 'string')
  ) {
    throw new Error('Resposta de autenticação inválida.');
  }
  return { ...session, role: roleFromUser(session.user) };
}

export function onSessionChange(listener: (session: Session | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function loadSession(): Promise<Session | null> {
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

export async function saveSession(value: Session): Promise<void> {
  const session = validateSession(value);
  const version = ++generation;
  const write = persistence
    .catch(() => undefined)
    .then(async () => {
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

export async function clearStoredSession(): Promise<void> {
  generation++;
  memorySession = null;
  loaded = true;
  listeners.forEach((listener) => listener(null));
  const clear = persistence
    .catch(() => undefined)
    .then(async () => {
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
      await AsyncStorage.multiRemove(['authToken', 'user', 'sessionRole', 'activeVoipCall']);
    });
  persistence = clear;
  await clear;
}
