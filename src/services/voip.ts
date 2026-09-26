import { Alert, AppState, NativeModules, Platform } from 'react-native';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import api, { voipApi } from './api';
import { safeSetItem } from '../utils/storage';
import type { VoipConfig, VoipTokenResponse } from '../types';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const VOIP_CHANNEL_ID = 'pedeja-calls';
const VOIP_PUSH_TOKEN_KEY = 'voipPushToken';
const ACTIVE_CALL_KEY = 'activeVoipCall';

export type ActiveVoipCall = {
  uuid: string;
  callId: string;
  orderId: string;
  token: string;
  provider: string;
  identity: string;
  direction: 'outgoing' | 'incoming';
  callerName: string;
  startedAt: string;
  muted?: boolean;
};

type IncomingPayload = {
  callId?: string;
  uuid?: string;
  orderId?: string;
  callerName?: string;
  handle?: string;
  title?: string;
  event?: string;
  provider?: string;
  token?: string;
};

let setupDone = false;
let listenersBound = false;
let cachedConfig: VoipConfig | null = null;
let activeCall: ActiveVoipCall | null = null;

function canUseNativeVoip(): boolean {
  if (Platform.OS === 'web' || isExpoGo) return false;
  return Boolean(NativeModules.RNCallKeep);
}

function newCallUuid(): string {
  // RN moderno expõe crypto.randomUUID; fallback determinístico suficiente para CallKeep.
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function persistActiveCall(call: ActiveVoipCall | null) {
  activeCall = call;
  if (call) await safeSetItem(ACTIVE_CALL_KEY, JSON.stringify(call));
  else await safeSetItem(ACTIVE_CALL_KEY, '');
}

export function getActiveVoipCall(): ActiveVoipCall | null {
  return activeCall;
}

export async function setupVoipCallChannel() {
  if (Platform.OS !== 'android' || isExpoGo) return;
  await Notifications.setNotificationChannelAsync(VOIP_CHANNEL_ID, {
    name: 'Chamadas PedeJá',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#f95a0d',
    sound: 'default',
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function loadCallKeep() {
  return (await import('react-native-callkeep')).default;
}

async function loadVoipPush() {
  if (Platform.OS !== 'ios') return null;
  return (await import('react-native-voip-push-notification')).default;
}

async function registerPushTokenOnServer(token: string, platform: string) {
  try {
    await api.post('/notifications/register-token', {
      expoPushToken: token,
      platform,
    });
  } catch (err) {
    console.warn('[voip] failed to register push token:', err);
  }
}

function navigateToCallScreen(call: ActiveVoipCall) {
  // Evita navegação se a app ainda estiver a arrancar sem router montado.
  try {
    router.push({
      pathname: '/call',
      params: {
        uuid: call.uuid,
        callId: call.callId,
        orderId: call.orderId,
        callerName: call.callerName,
        direction: call.direction,
      },
    });
  } catch (err) {
    console.warn('[voip] navigate failed:', err);
  }
}

async function bindCallKeepListeners() {
  if (listenersBound || !canUseNativeVoip()) return;
  listenersBound = true;
  const RNCallKeep = await loadCallKeep();

  RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
    void (async () => {
      RNCallKeep.backToForeground();
      if (activeCall && (!callUUID || activeCall.uuid === callUUID)) {
        navigateToCallScreen(activeCall);
      }
    })();
  });

  RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
    void endVoipCall(callUUID);
  });

  RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ callUUID, muted }) => {
    if (activeCall && activeCall.uuid === callUUID) {
      const next: ActiveVoipCall = { ...activeCall, muted: Boolean(muted) };
      activeCall = next;
      void persistActiveCall(next);
    }
  });

  RNCallKeep.addEventListener('didLoadWithEvents', (events: { name: string; data: any }[]) => {
    if (!Array.isArray(events)) return;
    for (const event of events) {
      if (event?.name === 'RNCallKeepPerformAnswerCallAction' && event.data?.callUUID) {
        RNCallKeep.backToForeground();
        if (activeCall) navigateToCallScreen(activeCall);
      }
      if (event?.name === 'RNCallKeepPerformEndCallAction' && event.data?.callUUID) {
        void endVoipCall(event.data.callUUID);
      }
    }
  });
}

async function bindPushKitListeners() {
  if (Platform.OS !== 'ios' || !canUseNativeVoip()) return;
  const VoipPush = await loadVoipPush();
  if (!VoipPush) return;

  VoipPush.addEventListener('register', (token: string) => {
    void safeSetItem(VOIP_PUSH_TOKEN_KEY, token);
    void registerPushTokenOnServer(token, 'ios-voip');
  });

  VoipPush.addEventListener('notification', (notification: IncomingPayload) => {
    void displayIncomingVoipCall(notification);
    const uuid = notification.uuid ?? notification.callId;
    if (uuid) VoipPush.onVoipNotificationCompleted(uuid);
  });

  VoipPush.registerVoipToken();
}

/**
 * Inicializa CallKit / ConnectionService + PushKit.
 * Requer development build (não funciona no Expo Go).
 */
export async function initializeVoip(): Promise<boolean> {
  if (setupDone) return canUseNativeVoip();
  setupDone = true;

  await setupVoipCallChannel();
  await initializeCallAudio();

  if (!canUseNativeVoip()) {
    console.warn('[voip] native modules unavailable (web/Expo Go) — using JS fallback');
    return false;
  }

  try {
    const RNCallKeep = await loadCallKeep();
    await RNCallKeep.setup({
      ios: {
        appName: 'PedeJá',
        supportsVideo: false,
        includesCallsInRecents: true,
      },
      android: {
        alertTitle: 'Permissão de chamadas',
        alertDescription:
          'O PedeJá precisa de acesso à conta telefónica para mostrar chamadas nativas.',
        cancelButton: 'Cancelar',
        okButton: 'OK',
        additionalPermissions: [],
        selfManaged: true,
        foregroundService: {
          channelId: VOIP_CHANNEL_ID,
          channelName: 'Chamadas PedeJá',
          notificationTitle: 'Chamada PedeJá em curso',
        },
      },
    });

    await bindCallKeepListeners();
    await bindPushKitListeners();

    try {
      cachedConfig = (await voipApi.getConfig()).data as VoipConfig;
    } catch {
      cachedConfig = null;
    }

    // Regista também o Expo push token para wake Android / foreground iOS.
    try {
      const { data } = await Notifications.getExpoPushTokenAsync();
      if (data) await registerPushTokenOnServer(data, Platform.OS);
    } catch (err) {
      console.warn('[voip] expo push token unavailable:', err);
    }

    return true;
  } catch (err) {
    console.error('[voip] initialize failed:', err);
    return false;
  }
}

export async function displayIncomingVoipCall(payload: IncomingPayload) {
  const orderId = String(payload.orderId ?? '');
  const callId = String(payload.callId ?? payload.uuid ?? newCallUuid());
  const uuid = String(payload.uuid ?? callId);
  const callerName = String(payload.callerName ?? payload.title ?? 'Chamada PedeJá');
  const handle = String(payload.handle ?? orderId ?? 'pedeja');

  const call: ActiveVoipCall = {
    uuid,
    callId,
    orderId,
    token: String(payload.token ?? ''),
    provider: String(payload.provider ?? cachedConfig?.provider ?? 'mock'),
    identity: '',
    direction: 'incoming',
    callerName,
    startedAt: new Date().toISOString(),
  };
  await persistActiveCall(call);

  if (canUseNativeVoip()) {
    const RNCallKeep = await loadCallKeep();
    RNCallKeep.displayIncomingCall(uuid, handle, callerName, 'generic', false);
    if (AppState.currentState === 'active') {
      navigateToCallScreen(call);
    }
    return call;
  }

  // Fallback JS (Expo Go / web): alerta local.
  Alert.alert('Chamada a entrar', `${callerName} — Pedido #${orderId.slice(-4) || '----'}`, [
    { text: 'Recusar', style: 'cancel', onPress: () => void endVoipCall(uuid) },
    { text: 'Atender', onPress: () => navigateToCallScreen(call) },
  ]);
  return call;
}

export async function startVoipCall(orderId: string): Promise<VoipTokenResponse | null> {
  if (!orderId || orderId.startsWith('local-')) {
    Alert.alert('Chamada indisponível', 'Este pedido ainda não está sincronizado com o servidor.');
    return null;
  }

  try {
    const [{ data: config }, { data: tokenData }] = await Promise.all([
      voipApi.getConfig(),
      voipApi.requestToken(orderId),
    ]);
    cachedConfig = config as VoipConfig;
    const session = tokenData as VoipTokenResponse;
    const uuid = newCallUuid();
    const callerName = 'Entrega PedeJá';

    const call: ActiveVoipCall = {
      uuid,
      callId: session.callId,
      orderId: session.orderId,
      token: session.token,
      provider: session.provider,
      identity: session.identity,
      direction: 'outgoing',
      callerName,
      startedAt: new Date().toISOString(),
    };
    await persistActiveCall(call);

    if (canUseNativeVoip()) {
      const RNCallKeep = await loadCallKeep();
      RNCallKeep.startCall(uuid, orderId, callerName, 'generic', false);
      RNCallKeep.updateDisplay(uuid, callerName, orderId);
    }

    navigateToCallScreen(call);
    return session;
  } catch (err) {
    console.error('Failed to start VoIP call:', err);
    Alert.alert('Erro', 'Não foi possível iniciar a chamada. Tente novamente.');
    return null;
  }
}

export async function endVoipCall(uuid?: string) {
  const target = uuid ?? activeCall?.uuid;
  if (canUseNativeVoip() && target) {
    try {
      const RNCallKeep = await loadCallKeep();
      RNCallKeep.endCall(target);
    } catch (err) {
      console.warn('[voip] endCall native failed:', err);
    }
  }
  await cleanupCallAudio();
  await persistActiveCall(null);
}

export async function setVoipMuted(muted: boolean) {
  if (!activeCall) return;
  if (canUseNativeVoip()) {
    const RNCallKeep = await loadCallKeep();
    RNCallKeep.setMutedCall(activeCall.uuid, muted);
  }
  activeCall = { ...activeCall, muted };
  await persistActiveCall(activeCall);
}

/**
 * Interpreta payload de notificação/push e dispara CallKeep se for voip_incoming.
 */
export function maybeHandleVoipNotificationData(data: Record<string, unknown> | undefined) {
  if (!data) return;
  const event = String(data.event ?? data.type ?? '');
  if (event !== 'voip_incoming' && data.status !== 'incoming') return;
  void displayIncomingVoipCall(data as IncomingPayload);
}

export function getVoipChannelId() {
  return cachedConfig?.native?.android?.channelId ?? VOIP_CHANNEL_ID;
}

let currentSound: AudioPlayer | null = null;

export async function initializeCallAudio(): Promise<void> {
  try {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      shouldRouteThroughEarpiece: false,
    });
  } catch (err) {
    console.warn('[voip] audio init failed:', err);
  }
}

export async function setSpeakerEnabled(enabled: boolean): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      shouldRouteThroughEarpiece: !enabled,
    });
  } catch (err) {
    console.warn('[voip] speaker toggle failed:', err);
  }
}

export async function playCallSound(type: 'ringtone' | 'connected' | 'ended'): Promise<void> {
  try {
    if (currentSound) {
      currentSound.remove();
      currentSound = null;
    }

    let soundSource;
    switch (type) {
      case 'ringtone':
        return;
      case 'connected':
        return;
      case 'ended':
        return;
    }

    if (soundSource) {
      const player = createAudioPlayer(soundSource);
      player.play();
      currentSound = player;
    }
  } catch (err) {
    console.warn('[voip] play sound failed:', err);
  }
}

export async function stopCallSound(): Promise<void> {
  try {
    if (currentSound) {
      currentSound.pause();
      currentSound.remove();
      currentSound = null;
    }
  } catch (err) {
    console.warn('[voip] stop sound failed:', err);
  }
}

export async function cleanupCallAudio(): Promise<void> {
  await stopCallSound();
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      interruptionMode: 'duckOthers',
      shouldRouteThroughEarpiece: true,
    });
  } catch (err) {
    console.warn('[voip] audio cleanup failed:', err);
  }
}
