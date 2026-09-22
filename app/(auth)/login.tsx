import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { authApi } from "../../src/services/api";
import { saveDemoSession, roleFromUser } from "../../src/services/demoAuth";
import { useAppDispatch } from "../../src/store";
import { clearSession, setSession } from "../../src/store/authSlice";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

type UserRole = "client" | "delivery" | "restaurant";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ role?: UserRole }>();
  const initialRole = params.role === "delivery" ? "delivery" : params.role === "restaurant" ? "restaurant" : "client";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));
  const dispatch = useAppDispatch();

  const styles = React.useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      gap: spacing.lg,
    },
    logoSection: {
      alignItems: "center",
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    logo: {
      width: 200,
      height: 200,
      marginTop: -spacing.md,
      marginBottom: -spacing.md,
    },
    tagline: {
      fontSize: 14,
      color: colors.neutral[500],
      marginTop: spacing.xs,
    },
    roleSelector: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    roleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    roleButtonActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    roleText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.neutral[500],
    },
    roleTextActive: {
      color: colors.white,
    },
    formCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      borderRadius: 24,
      padding: spacing.lg,
      gap: spacing.md,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.neutral[50],
      borderWidth: 1,
      borderColor: colors.neutral[200],
      borderRadius: 16,
      paddingHorizontal: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.sm,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md,
      fontSize: 16,
      color: colors.neutral[900],
    },
    passwordInput: {
      paddingRight: 40,
    },
    eyeButton: {
      position: "absolute",
      right: spacing.md,
      height: "100%",
      justifyContent: "center",
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
    },
    demoSection: {
      alignItems: "center",
      marginTop: spacing.xs,
    },
    demoButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    demoButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary[500],
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    footerText: {
      fontSize: 14,
      color: colors.neutral[500],
    },
    footerLink: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary[500],
    },
  }), [colors]);

  useEffect(() => {
    if (params.role) {
      const newRole = params.role === "delivery" ? "delivery" : params.role === "restaurant" ? "restaurant" : "client";
      setRole(newRole);
    }
  }, [params.role]);

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Preencha o email e a senha.");
      triggerShake();
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Por favor, insira um email válido.");
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login({
        identificador: normalizedEmail,
        password,
      });

      const { token, refreshToken, user } = response.data;
      const sessionRole = roleFromUser(user);

      await saveDemoSession({ token, refreshToken, user, role: sessionRole });
      dispatch(setSession({ token, user, role: sessionRole }));
    } catch (loginError: any) {
      const data = loginError?.response?.data;
      const code = data?.code;
      const message = data?.message || "Email ou senha incorretos.";
      if (code === "PHONE_NOT_VERIFIED") {
        setError("Conta ainda não verificada. A confirmar automaticamente...");
        try {
          await authApi.requestOtp(normalizedEmail).catch(() => authApi.requestOtp(email.trim()));
        } catch {}
        // tenta verificar via dev-code se estiver em dev
        if (__DEV__) {
          try {
            const tel = email.trim();
            // tenta como telefone também
            const devRes = await (await import("../../src/services/api")).default.get(`/auth/otp/dev-code`, { params: { telefone: tel } }).catch(() => null);
            if (devRes?.data?.codigo) {
              const verifyRes = await authApi.verifyOtp(tel, devRes.data.codigo);
              const { token: t, refreshToken: rt, user: u } = verifyRes.data;
              const sRole = roleFromUser(u);
              await saveDemoSession({ token: t, refreshToken: rt, user: u, role: sRole });
              dispatch(setSession({ token: t, user: u, role: sRole }));
              return;
            }
          } catch {}
        }
      }
      setError(message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/images/P.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Entre e aproveite</Text>
          </View>

          {/* Seletor de perfil */}
          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, role === "client" && styles.roleButtonActive]}
              onPress={() => setRole("client")}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={role === "client" ? colors.white : colors.neutral[500]}
              />
              <Text style={[styles.roleText, role === "client" && styles.roleTextActive]}>
                Cliente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "delivery" && styles.roleButtonActive]}
              onPress={() => setRole("delivery")}
            >
              <Ionicons
                name="bicycle-outline"
                size={18}
                color={role === "delivery" ? colors.white : colors.neutral[500]}
              />
              <Text style={[styles.roleText, role === "delivery" && styles.roleTextActive]}>
                Entregador
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "restaurant" && styles.roleButtonActive]}
              onPress={() => setRole("restaurant")}
            >
              <Ionicons
                name="restaurant-outline"
                size={18}
                color={role === "restaurant" ? colors.white : colors.neutral[500]}
              />
              <Text style={[styles.roleText, role === "restaurant" && styles.roleTextActive]}>
                Restaurante
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 12, color: colors.neutral[500], textAlign: "center", marginBottom: 4 }}>
            O painel que verás depende da tua conta (cliente / entregador / restaurante), não do botão acima.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => { setEmail("restaurante@pedeja.com"); setPassword("123456"); setRole("restaurant"); }}
              style={{ flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: 10, padding: 8, alignItems: "center", borderWidth: 1, borderColor: colors.surfaceVariant }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurface }}>Demo Restaurante</Text>
              <Text style={{ fontSize: 10, color: colors.neutral[500] }}>restaurante@pedeja.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setEmail("demo-ent@pedeja.ao"); setPassword("segredo123"); setRole("delivery"); }}
              style={{ flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: 10, padding: 8, alignItems: "center", borderWidth: 1, borderColor: colors.surfaceVariant }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurface }}>Demo Entregador</Text>
              <Text style={{ fontSize: 10, color: colors.neutral[500] }}>demo-ent@pedeja.ao</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setEmail(""); setPassword(""); setRole("client"); }}
              style={{ flex: 1, backgroundColor: colors.surfaceContainer, borderRadius: 10, padding: 8, alignItems: "center", borderWidth: 1, borderColor: colors.surfaceVariant }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: colors.onSurface }}>Cliente</Text>
              <Text style={{ fontSize: 10, color: colors.neutral[500] }}>auto-registo</Text>
            </TouchableOpacity>
          </View>

          {/* Formulário */}
          <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.neutral[500]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Senha"
                placeholderTextColor={colors.neutral[500]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((value) => !value)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={loading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
            />

          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
