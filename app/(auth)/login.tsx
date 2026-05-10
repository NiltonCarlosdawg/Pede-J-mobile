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
import {
    clearDemoSession,
    createDemoSession,
    DEMO_LOGIN,
    DemoRole,
    isDemoCredentials,
    saveDemoSession,
} from "../../src/services/demoAuth";
import { useAppDispatch } from "../../src/store";
import { clearSession, setSession } from "../../src/store/authSlice";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const DEMO_DELAY_MS = 1200;

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ role?: DemoRole }>();
  const initialRole = params.role === "delivery" ? "delivery" : "client";

  const [role, setRole] = useState<DemoRole>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));
  const dispatch = useAppDispatch();

  // Styles com tema dinâmico
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
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      gap: spacing.lg,
    },
    logoSection: {
      alignItems: "center",
      marginBottom: spacing.md,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: spacing.md,
    },
    appName: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.onSurface,
      letterSpacing: -0.5,
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
      marginTop: spacing.md,
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
      const newRole = params.role === "delivery" ? "delivery" : "client";
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

    if (!isDemoCredentials(normalizedEmail, password, role)) {
      setError("Email ou senha incorretos.");
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS));

      const session = createDemoSession(role);
      await saveDemoSession(session);
      dispatch(setSession(session));
    } catch (loginError) {
      console.error("[demo-auth] login failed", loginError);
      setError("Não foi possível iniciar a sessão.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin() {
    const credentials = role === "delivery" ? DEMO_LOGIN.delivery : DEMO_LOGIN.client;
    setEmail(credentials.email);
    setPassword(credentials.password);
    setError(null);
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
            <Text style={styles.appName}>PedeJá</Text>
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

            {/* Demo helper */}
            <View style={styles.demoSection}>
              <TouchableOpacity onPress={handleQuickLogin} style={styles.demoButton}>
                <Ionicons name="flash-outline" size={14} color={colors.primary[500]} />
                <Text style={styles.demoButtonText}>Preencher dados demo</Text>
              </TouchableOpacity>
            </View>
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
