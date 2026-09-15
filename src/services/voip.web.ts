import { Alert } from 'react-native';
import { router } from 'expo-router';
import { voipApi } from './api';
import type { VoipTokenResponse } from '../types';

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

let activeCall: ActiveVoipCall | null = null;

export function getActiveVoipCall() {
  return activeCall;
}

export async function initializeVoip() {
  return false;
}

export async function setupVoipCallChannel() {}

export async function startVoipCall(orderId: string): Promise<VoipTokenResponse | null> {
  if (!orderId || orderId.startsWith('local-')) {
    Alert.alert('Chamada indisponível', 'Este pedido ainda não está sincronizado com o servidor.');
    return null;
  }
  try {
    const { data } = await voipApi.requestToken(orderId);
    const session = data as VoipTokenResponse;
    activeCall = {
      uuid: session.callId,
      callId: session.callId,
      orderId: session.orderId,
      token: session.token,
      provider: session.provider,
      identity: session.identity,
      direction: 'outgoing',
      callerName: 'Entrega PedeJá',
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
    return session;
  } catch {
    Alert.alert('Erro', 'Não foi possível iniciar a chamada na web.');
    return null;
  }
}

export async function endVoipCall() {
  activeCall = null;
}

export async function setVoipMuted(muted: boolean) {
  if (activeCall) activeCall = { ...activeCall, muted };
}

export function maybeHandleVoipNotificationData(_data?: Record<string, unknown>) {}

export function getVoipChannelId() {
  return 'pedeja-calls';
}
