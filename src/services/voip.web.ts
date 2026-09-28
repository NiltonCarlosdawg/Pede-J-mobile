import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { callsApi } from './api';
import type { CallSessionResponse } from '../types';

export type ActiveVoipCall = {
  uuid: string;
  callId: string;
  orderId: string;
  token: string;
  roomName?: string;
  livekitUrl?: string;
  provider: string;
  identity: string;
  direction: 'outgoing' | 'incoming';
  callerName: string;
  startedAt: string;
  muted?: boolean;
};

let activeCall: ActiveVoipCall | null = null;

export function getActiveVoipCall() {
  return activeCall;
}

export async function initializeVoip() {
  return false;
}

export async function setupVoipCallChannel() {}

export async function initializeCallAudio() {}
export async function cleanupCallAudio() {}
export async function setSpeakerEnabled(_enabled: boolean) {}

export async function startVoipCall(orderId: string): Promise<ActiveVoipCall | null> {
  if (!orderId) {
    Alert.alert('Chamada indisponível', 'Pedido inválido.');
    return null;
  }
  try {
    const { data } = await callsApi.initiate(orderId, Crypto.randomUUID());
    const session = data as CallSessionResponse;
    activeCall = {
      uuid: session.callId,
      callId: session.callId,
      orderId: session.orderId,
      token: session.token,
      roomName: session.roomName,
      livekitUrl: session.livekitUrl,
      provider: session.provider,
      identity: session.identity,
      direction: 'outgoing',
      callerName: session.calleeName ?? session.callerName ?? 'Entrega PedeJá',
      startedAt: new Date().toISOString(),
    };
    router.push({
      pathname: '/call',
      params: {
        uuid: activeCall.uuid,
        callId: activeCall.callId,
        orderId: activeCall.orderId,
        callerName: activeCall.callerName,
        direction: 'outgoing',
      },
    });
    return activeCall;
  } catch {
    Alert.alert('Erro', 'Não foi possível iniciar a chamada na web.');
    return null;
  }
}

export async function answerVoipCall(callId?: string): Promise<ActiveVoipCall | null> {
  const id = callId ?? activeCall?.callId;
  if (!id) return null;
  if (activeCall?.token) return activeCall;
  try {
    const { data } = await callsApi.accept(id);
    const session = data as CallSessionResponse;
    activeCall = {
      uuid: activeCall?.uuid ?? session.callId,
      callId: session.callId,
      orderId: session.orderId,
      token: session.token,
      roomName: session.roomName,
      livekitUrl: session.livekitUrl,
      provider: session.provider,
      identity: session.identity,
      direction: activeCall?.direction ?? 'incoming',
      callerName: activeCall?.callerName ?? 'Chamada PedeJá',
      startedAt: activeCall?.startedAt ?? new Date().toISOString(),
      muted: activeCall?.muted,
    };
    return activeCall;
  } catch {
    Alert.alert('Chamada', 'Não foi possível atender a chamada.');
    return null;
  }
}

export async function endVoipCall(_uuid?: string, outcome: 'ended' | 'declined' = 'ended') {
  const id = activeCall?.callId;
  if (id) {
    const declined =
      outcome === 'declined' || (activeCall?.direction === 'incoming' && !activeCall?.token);
    try {
      await callsApi.setStatus(id, declined ? 'declined' : 'ended');
    } catch {
      // estado já sincronizado pelo servidor (timeout) — ignorar
    }
  }
  activeCall = null;
}

export async function setVoipMuted(muted: boolean) {
  if (activeCall) activeCall = { ...activeCall, muted };
}

export function maybeHandleVoipNotificationData(_data?: Record<string, unknown>) {}

export async function subscribeVoipEvents(): Promise<() => void> {
  // Web não usa Socket.IO para chamadas (sem CallKit/PushKit no browser).
  return () => undefined;
}

export function getVoipChannelId() {
  return 'pedeja-calls';
}

export async function displayIncomingVoipCall(_payload: Record<string, unknown>) {}
