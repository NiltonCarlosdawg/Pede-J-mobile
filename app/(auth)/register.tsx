import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { DemoRole } from "../../src/services/demoAuth";
import { useAppDispatch } from "../../src/store";
import { setSession } from "../../src/store/authSlice";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";
import type { User } from "../../src/types";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      width: 148,
      height: 148,
      marginBottom: spacing.sm,
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
    termsSection: {
      alignItems: "center",
    },
    termsText: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.neutral[500],
      textAlign: "center",
    },
    termsLink: {
      fontWeight: "600",
      color: colors.primary[500],
    },
  }), [colors]);

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  const validateForm = () => {
    if (!name.trim()) {
      setError("Por favor preencha o nome completo.");
      triggerShake();
      return false;
    }

    if (!email.trim()) {
      setError("Por favor preencha o e-mail.");
      triggerShake();
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor insira um e-mail válido.");
      triggerShake();
      return false;
    }

    if (!password) {
      setError("Por favor preencha a senha.");
      triggerShake();
      return false;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      triggerShake();
      return false;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      triggerShake();
      return false;
    }

    return true;
  };

  async function handleRegister() {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      const demoSession = {
        token: `demo-token-${Date.now()}`,
        user: newUser,
        role: "client" as DemoRole,
      };

      dispatch(setSession(demoSession));
      router.replace("/(tabs)");
    } catch (err) {
      console.error("[register] error:", err);
      setError("Não foi possível criar a conta. Tente novamente.");
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
            <Text style={styles.appName}>PedeJá</Text>
            <Text style={styles.tagline}>Crie sua conta e comece</Text>
          </View>

          {/* Formulário */}
          <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                placeholderTextColor={colors.neutral[500]}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
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
              <Ionicons name="call-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone (opcional)"
                placeholderTextColor={colors.neutral[500]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
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
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirmar senha"
                placeholderTextColor={colors.neutral[500]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((s) => !s)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={loading ? "Criando conta..." : "Criar conta"}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.footerLink}>Entre aqui</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              Ao criar uma conta, você concorda com nossos{" "}
              <Text style={styles.termsLink}>Termos de Serviço</Text> e{" "}
              <Text style={styles.termsLink}>Política de Privacidade</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
