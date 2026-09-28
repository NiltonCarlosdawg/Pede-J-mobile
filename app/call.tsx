import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Room, RoomEvent, type RemoteParticipant } from 'livekit-client';

import { useTheme } from '../src/hooks/useTheme';
import {
  answerVoipCall,
  cleanupCallAudio,
  endVoipCall,
  getActiveVoipCall,
  initializeCallAudio,
  setSpeakerEnabled,
  setVoipMuted,
} from '../src/services/voip';
import { getRealtimeSocket } from '../src/services/realtime';
import { setAppSoundsSuppressed } from '../src/utils/sounds';
import { spacing, typography } from '../src/theme';

type Phase =
  | 'preparing' // a obter token/globals
  | 'ringing' // ligado à sala, à espera do outro
  | 'connected' // participante remoto presente — cronómetro a correr
  | 'reconnecting'
  | 'ended'
  | 'error';

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uuid?: string;
    callId?: string;
    orderId?: string;
    callerName?: string;
    direction?: string;
  }>();
  const { colors } = useTheme();

  const active = getActiveVoipCall();
  const callerName = params.callerName ?? active?.callerName ?? 'Chamada PedeJá';
  const orderId = params.orderId ?? active?.orderId ?? '';
  const direction = params.direction ?? active?.direction ?? 'outgoing';
  const callId = params.callId ?? active?.callId ?? '';

  const [phase, setPhase] = useState<Phase>('preparing');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(Boolean(active?.muted));
  const [speaker, setSpeaker] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const liveKitRef = useRef<typeof import('@livekit/react-native') | null>(null);
  const answeredRef = useRef(false);
  const [answered, setAnswered] = useState(false);
  const cleanedRef = useRef(false);

  // Cronómetro — só depois de o participante remoto entrar (atendimento real).
  useEffect(() => {
    if (!answeredRef.current) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    let cancelled = false;

    const finishWithError = (message: string) => {
      if (cancelled) return;
      setPhase('error');
      setError(message);
    };

    void (async () => {
      // 1. Sessão da chamada — quem recebe pede o token da sala aqui.
      let call = getActiveVoipCall();
      if (call && !call.token) call = (await answerVoipCall(call.callId)) ?? call;
      if (!call?.token || !call?.livekitUrl || !call?.roomName) {
        finishWithError('Chamada indisponível: não foi possível obter a sessão de voz.');
        return;
      }

      // 2. Globals do LiveKit (WebRTC) — exige development build.
      //    Nota: a partir daqui o LiveKit é dono do AVAudioSession no iOS.
      //    Chamar setAudioModeAsync (expo-audio) durante a chamada rouba a
      //    sessão ao WebRTC e o áudio deixa de funcionar (LiveKit #286).
      try {
        const lk = await import('@livekit/react-native');
        lk.registerGlobals();
        await lk.AudioSession.startAudioSession();
        liveKitRef.current = lk;
        // Sons da app silenciados enquanto o LiveKit é dono do AVAudioSession.
        setAppSoundsSuppressed(true);
      } catch (err) {
        // Sem módulos nativos (Expo Go / web) — fallback JS: expo-audio trata o áudio.
        await initializeCallAudio();
        console.warn('[call] LiveKit indisponível:', err);
        finishWithError(
          'As chamadas de voz exigem um development build nativo (não correm no Expo Go).',
        );
        return;
      }
      if (cancelled) return;
      setPhase('ringing');

      // 3. Ligar à sala LiveKit.
      try {
        const next = new Room();
        roomRef.current = next;

        const markAnswered = (participant?: RemoteParticipant) => {
          if (participant) answeredRef.current = true;
          else if (next.remoteParticipants.size > 0) answeredRef.current = true;
          if (answeredRef.current) {
            setAnswered(true);
            setPhase('connected');
          }
        };

        next.on(RoomEvent.Connected, () => markAnswered());
        next.on(RoomEvent.ParticipantConnected, (p) => markAnswered(p));
        next.on(RoomEvent.ParticipantDisconnected, () => {
          answeredRef.current = false;
          setAnswered(false);
          setPhase('ringing');
        });
        next.on(RoomEvent.Reconnecting, () => setPhase('reconnecting'));
        next.on(RoomEvent.Reconnected, () =>
          setPhase(answeredRef.current ? 'connected' : 'ringing'),
        );
        next.on(RoomEvent.Disconnected, () => {
          if (!cleanedRef.current) setPhase('ended');
        });

        await next.connect(call!.livekitUrl!, call!.token!, { autoSubscribe: true });
        await next.localParticipant.setMicrophoneEnabled(true);
        if (cancelled) {
          next.disconnect(true);
          return;
        }
        markAnswered();
      } catch (err) {
        console.warn('[call] ligação falhou:', err);
        finishWithError(
          'Não foi possível ligar ao servidor de chamadas. Verifique a rede e tente novamente.',
        );
      }
    })();

    // Evento de chamada não atendida (timeout do backend).
    let offMissed: (() => void) | undefined;
    void getRealtimeSocket()
      .then((socket) => {
        const onMissed = (payload: { callId?: string }) => {
          if (!callId || payload?.callId !== callId) return;
          setPhase('ended');
          setError('A chamada não foi atendida.');
        };
        socket.on('call_missed', onMissed);
        offMissed = () => socket.off('call_missed', onMissed);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      cleanedRef.current = true;
      offMissed?.();
      setAppSoundsSuppressed(false);
      void roomRef.current?.disconnect(true).catch(() => undefined);
      roomRef.current = null;
      if (liveKitRef.current) {
        // O LiveKit geriu a sessão de áudio — é ele que a encerra.
        void liveKitRef.current.AudioSession.stopAudioSession().catch(() => undefined);
      } else {
        // Sem LiveKit: o expo-audio é quem tratou do áudio, resta o estado normal.
        void cleanupCallAudio();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.onSurface },
        content: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: spacing.xxl,
          paddingHorizontal: spacing.lg,
        },
        top: { alignItems: 'center', marginTop: spacing.xl },
        status: {
          ...typography.bodySm,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: spacing.sm,
        },
        name: {
          ...typography.h1,
          color: colors.white,
          textAlign: 'center',
          fontWeight: '800',
        },
        meta: {
          ...typography.bodySm,
          color: 'rgba(255,255,255,0.65)',
          marginTop: spacing.sm,
        },
        timer: {
          ...typography.h2,
          color: colors.white,
          marginTop: spacing.lg,
          fontWeight: '700',
        },
        avatar: {
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: colors.primary[500],
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xl,
        },
        controls: {
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginBottom: spacing.xl,
        },
        controlBtn: { alignItems: 'center', gap: 8 },
        controlCircle: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        controlCircleActive: {
          backgroundColor: colors.white,
        },
        controlLabel: {
          ...typography.bodySm,
          color: 'rgba(255,255,255,0.85)',
          fontWeight: '600',
        },
        hangup: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.error,
          alignItems: 'center',
          justifyContent: 'center',
        },
        errorBox: {
          marginTop: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.1)',
          maxWidth: '100%',
        },
        errorText: {
          ...typography.bodySm,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
        },
        quality: {
          ...typography.bodySm,
          color: 'rgba(255,255,255,0.6)',
          marginTop: spacing.sm,
        },
      }),
    [colors],
  );

  function formatTimer(total: number) {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const statusLabel =
    phase === 'error'
      ? 'Chamada indisponível'
      : phase === 'ended'
        ? 'Chamada terminada'
        : phase === 'reconnecting'
          ? 'A reconectar…'
          : phase === 'connected'
            ? 'Em chamada'
            : phase === 'ringing'
              ? direction === 'incoming'
                ? 'A ligar…'
                : 'A aguardar atendimento…'
              : 'A preparar…';

  async function toggleMute() {
    const next = !muted;
    setMuted(next);
    try {
      const room = roomRef.current;
      const publication = Array.from(
        room?.localParticipant.audioTrackPublications.values() ?? [],
      )[0];
      if (publication) {
        if (next) await publication.mute();
        else await publication.unmute();
      } else {
        await room?.localParticipant.setMicrophoneEnabled(!next);
      }
    } catch (err) {
      console.warn('[call] mute failed:', err);
    }
    await setVoipMuted(next);
  }

  async function toggleSpeaker() {
    const next = !speaker;
    setSpeaker(next);
    const lk = liveKitRef.current;
    if (lk) {
      // O LiveKit é dono do AVAudioSession durante a chamada: usar o
      // expo-audio (setAudioModeAsync) aqui roubaria a sessão ao WebRTC e
      // cortava o áudio no iOS (LiveKit #286).
      try {
        const outputs = await lk.AudioSession.getAudioOutputs();
        const wanted =
          Platform.OS === 'ios'
            ? next
              ? 'force_speaker'
              : 'default'
            : next
              ? 'speaker'
              : 'earpiece';
        if (outputs.includes(wanted)) await lk.AudioSession.selectAudioOutput(wanted);
      } catch (err) {
        console.warn('[call] speaker switch failed:', err);
      }
      return;
    }
    // Fallback (sem módulos nativos): o expo-audio é quem gere o áudio.
    await setSpeakerEnabled(next);
  }

  async function hangup() {
    const remoteJoined = answeredRef.current;
    const activeCall = getActiveVoipCall();
    await endVoipCall(
      params.uuid ?? activeCall?.uuid,
      direction === 'incoming' && !remoteJoined ? 'declined' : 'ended',
    );
    if (router.canGoBack()) router.back();
    else router.replace(orderId ? { pathname: '/(tabs)/rastreamento' } : '/(tabs)');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.status}>{statusLabel}</Text>
          <Text style={styles.name}>{callerName}</Text>
          <Text style={styles.meta}>
            Pedido #{orderId ? orderId.slice(-4) : '----'} · Voz LiveKit
          </Text>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={56} color={colors.white} />
          </View>

          {phase === 'preparing' && (
            <ActivityIndicator color={colors.white} style={{ marginTop: spacing.lg }} />
          )}

          <Text style={styles.timer}>{answered ? formatTimer(seconds) : '--:--'}</Text>

          {phase === 'connected' && (
            <Text style={styles.quality}>
              Ligação ativa · {muted ? 'micro desligado' : 'micro ligado'}
            </Text>
          )}

          {phase === 'error' && error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {phase === 'ended' && error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={toggleMute}
            disabled={phase === 'error'}
          >
            <View style={[styles.controlCircle, muted && styles.controlCircleActive]}>
              <MaterialCommunityIcons
                name={muted ? 'microphone-off' : 'microphone'}
                size={28}
                color={muted ? colors.onSurface : colors.white}
              />
            </View>
            <Text style={styles.controlLabel}>{muted ? 'Micro off' : 'Silenciar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={hangup}>
            <View style={styles.hangup}>
              <MaterialCommunityIcons name="phone-hangup" size={32} color={colors.white} />
            </View>
            <Text style={styles.controlLabel}>Desligar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={toggleSpeaker}
            disabled={phase === 'error'}
          >
            <View style={[styles.controlCircle, speaker && styles.controlCircleActive]}>
              <MaterialCommunityIcons
                name={speaker ? 'volume-high' : 'volume-medium'}
                size={28}
                color={speaker ? colors.onSurface : colors.white}
              />
            </View>
            <Text style={styles.controlLabel}>Altifalante</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
