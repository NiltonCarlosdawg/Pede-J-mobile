import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../src/hooks/useTheme";
import {
  endVoipCall,
  getActiveVoipCall,
  setVoipMuted,
  setSpeakerEnabled,
  initializeCallAudio,
  cleanupCallAudio,
} from "../src/services/voip";
import { spacing, typography } from "../src/theme";

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
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(Boolean(active?.muted));
  const [speaker, setSpeaker] = useState(false);

  const callerName = params.callerName ?? active?.callerName ?? "Chamada PedeJá";
  const orderId = params.orderId ?? active?.orderId ?? "";
  const direction = params.direction ?? active?.direction ?? "outgoing";
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    initializeCallAudio();
    return () => {
      cleanupCallAudio();
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [connected]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.onSurface },
        content: {
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: spacing.xxl,
          paddingHorizontal: spacing.lg,
        },
        top: { alignItems: "center", marginTop: spacing.xl },
        status: {
          ...typography.bodySm,
          color: "rgba(255,255,255,0.7)",
          marginBottom: spacing.sm,
        },
        name: {
          ...typography.h1,
          color: colors.white,
          textAlign: "center",
          fontWeight: "800",
        },
        meta: {
          ...typography.bodySm,
          color: "rgba(255,255,255,0.65)",
          marginTop: spacing.sm,
        },
        timer: {
          ...typography.h2,
          color: colors.white,
          marginTop: spacing.lg,
          fontWeight: "700",
        },
        avatar: {
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: colors.primary[500],
          alignItems: "center",
          justifyContent: "center",
          marginTop: spacing.xl,
        },
        controls: {
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: spacing.xl,
        },
        controlBtn: { alignItems: "center", gap: 8 },
        controlCircle: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "rgba(255,255,255,0.15)",
          alignItems: "center",
          justifyContent: "center",
        },
        controlCircleActive: {
          backgroundColor: colors.white,
        },
        controlLabel: {
          ...typography.bodySm,
          color: "rgba(255,255,255,0.85)",
          fontWeight: "600",
        },
        hangup: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.error,
          alignItems: "center",
          justifyContent: "center",
        },
      }),
    [colors]
  );

  function formatTimer(total: number) {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function toggleMute() {
    const next = !muted;
    setMuted(next);
    await setVoipMuted(next);
  }

  async function toggleSpeaker() {
    const next = !speaker;
    setSpeaker(next);
    await setSpeakerEnabled(next);
  }

  async function hangup() {
    await endVoipCall(params.uuid ?? active?.uuid);
    if (router.canGoBack()) router.back();
    else router.replace(orderId ? { pathname: "/(tabs)/rastreamento" } : "/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={styles.status}>
            {!connected
              ? direction === "incoming"
                ? "Chamada recebida"
                : "A ligar…"
              : "Em chamada"}
          </Text>
          <Text style={styles.name}>{callerName}</Text>
          <Text style={styles.meta}>
            Pedido #{orderId ? orderId.slice(-4) : "----"} · VoIP
            {!connected ? " · a aguardar atendimento real" : ""}
          </Text>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={56} color={colors.white} />
          </View>
          <Text style={styles.timer}>{connected ? formatTimer(seconds) : "--:--"}</Text>
          {!connected ? (
            <TouchableOpacity
              style={{ marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 12, backgroundColor: colors.white }}
              onPress={() => setConnected(true)}
            >
              <Text style={{ color: colors.onSurface, fontWeight: "700" }}>Simular atendimento (backend deve confirmar)</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: spacing.sm, textAlign: "center" }}>
            O cronómetro só avança após atendimento confirmado pelo servidor/SDK de voz. Integrar provedor WebRTC/Twilio aqui.
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute}>
            <View style={[styles.controlCircle, muted && styles.controlCircleActive]}>
              <MaterialCommunityIcons
                name={muted ? "microphone-off" : "microphone"}
                size={28}
                color={muted ? colors.onSurface : colors.white}
              />
            </View>
            <Text style={styles.controlLabel}>{muted ? "Micro off" : "Silenciar"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={hangup}>
            <View style={styles.hangup}>
              <MaterialCommunityIcons name="phone-hangup" size={32} color={colors.white} />
            </View>
            <Text style={styles.controlLabel}>Desligar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleSpeaker}>
            <View style={[styles.controlCircle, speaker && styles.controlCircleActive]}>
              <MaterialCommunityIcons
                name={speaker ? "volume-high" : "volume-medium"}
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
