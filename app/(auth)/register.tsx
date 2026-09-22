import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useTheme } from "../../src/hooks/useTheme";
import { authApi } from "../../src/services/api";
import { saveDemoSession, roleFromUser } from "../../src/services/demoAuth";
import { useAppDispatch } from "../../src/store";
import { setSession } from "../../src/store/authSlice";
import { spacing } from "../../src/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const initialRole = params.role === "entregador" ? "entregador" : params.role === "restaurante" ? "restaurante" : "cliente";
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState<"cliente" | "entregador" | "restaurante">(initialRole as any);
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

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
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
          paddingTop: spacing.xs,
          paddingBottom: spacing.lg,
          gap: spacing.sm,
        },
        logoSection: {
          alignItems: "center",
          marginTop: -spacing.sm,
          marginBottom: spacing.sm,
        },
        logo: {
          width: 196,
          height: 196,
          marginBottom: spacing.xs,
        },
        tagline: {
          fontSize: 15,
          fontWeight: "600",
          color: colors.neutral[700],
          textAlign: "center",
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
      }),
    [colors]
  );

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

    if (!phone.trim()) {
      setError("Por favor preencha o telefone.");
      triggerShake();
      return false;
    }

    if (!password) {
      setError("Por favor preencha a senha.");
      triggerShake();
      return false;
    }

    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
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

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");

  async function handleRegister() {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        nome: name.trim(),
        email: email.trim().toLowerCase(),
        telefone: phone.trim(),
        password,
        role: selectedRole,
      });

      // Backend devolve { user, requiresOtp } sem tokens — é preciso verificar OTP
      if (response.data?.token && response.data?.user) {
        const { token, refreshToken, user } = response.data;
        const role = roleFromUser(user);
        await saveDemoSession({ token, refreshToken, user, role });
        dispatch(setSession({ token, user, role }));
        router.replace("/(tabs)");
        return;
      }

      // Fluxo OTP (obrigatório no backend atual)
      const telefone = phone.trim();
      setPendingPhone(telefone);
      await authApi.requestOtp(telefone);
      // Em dev, tenta obter o código automaticamente via /auth/otp/dev-code
      try {
        const { data } = await authApi.verifyOtp(telefone, "000000").catch(() => ({ data: null }));
        // Se chegou aqui, não há auto-verify — tenta buscar dev-code
        if (__DEV__) {
          const devRes = await (await import("../../src/services/api")).default.get(`/auth/otp/dev-code`, { params: { telefone } }).catch(() => null);
          if (devRes?.data?.codigo) {
            const verifyRes = await authApi.verifyOtp(telefone, devRes.data.codigo);
            const { token, refreshToken, user } = verifyRes.data;
            const role = roleFromUser(user);
            await saveDemoSession({ token, refreshToken, user, role });
            dispatch(setSession({ token, user, role }));
            router.replace("/(tabs)");
            return;
          }
        }
      } catch {}
      setOtpStep(true);
      setError("Enviámos um código por SMS. Em desenvolvimento, verifica o console do backend ou usa o código de teste.");
    } catch (err: any) {
      const data = err?.response?.data;
      const message = data?.message || (Array.isArray(data?.message) ? data.message.join(", ") : null) || "Não foi possível criar a conta. Tente novamente.";
      if (data?.code === "EMAIL_TAKEN" || data?.code === "PHONE_TAKEN") {
        setError(message);
      } else {
        setError(message);
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Insira o código de 6 dígitos enviado por SMS.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyOtp(pendingPhone, otpCode.trim());
      const { token, refreshToken, user } = res.data;
      const role = roleFromUser(user);
      await saveDemoSession({ token, refreshToken, user, role });
      dispatch(setSession({ token, user, role }));
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Código inválido ou expirado. Peça um novo.";
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!pendingPhone) return;
    setLoading(true);
    try {
      await authApi.requestOtp(pendingPhone);
      setError(null);
      // Tenta auto-preencher em dev
      if (__DEV__) {
        try {
          const devRes = await (await import("../../src/services/api")).default.get(`/auth/otp/dev-code`, { params: { telefone: pendingPhone } });
          if (devRes?.data?.codigo) setOtpCode(devRes.data.codigo);
        } catch {}
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Não foi possível reenviar o código.");
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
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/images/P.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Crie sua conta e comece agora</Text>
          </View>

          <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: colors.neutral[700], textAlign: "center" }}>Tipo de conta</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { id: "cliente", label: "Cliente", icon: "person" },
                { id: "entregador", label: "Entregador", icon: "bicycle" },
                { id: "restaurante", label: "Restaurante", icon: "storefront" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setSelectedRole(opt.id as any)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selectedRole === opt.id ? colors.primary[500] : colors.neutral[200],
                    backgroundColor: selectedRole === opt.id ? colors.primary[500] : colors.surfaceContainer,
                  }}
                >
                  <MaterialCommunityIcons name={opt.icon as any} size={16} color={selectedRole === opt.id ? colors.white : colors.neutral[500]} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: selectedRole === opt.id ? colors.white : colors.neutral[500] }}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
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
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
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
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor={colors.neutral[500]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
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
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
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

            {!otpStep ? (
              <Button
                title={loading ? "Criando conta..." : "Criar conta"}
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
              />
            ) : (
              <>
                <View style={styles.inputWrapper}>
                  <Ionicons name="keypad-outline" size={20} color={colors.neutral[500]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Código de 6 dígitos"
                    placeholderTextColor={colors.neutral[500]}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>
                <Button
                  title={loading ? "Verificando..." : "Verificar código"}
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={loading}
                />
                <TouchableOpacity onPress={handleResendOtp} disabled={loading} style={{ alignItems: "center", paddingVertical: 8 }}>
                  <Text style={styles.footerLink}>Reenviar código</Text>
                </TouchableOpacity>
                <Text style={[styles.termsText, { textAlign: "center" }]}>Enviado para {pendingPhone}. Em dev, o código aparece no terminal do backend (SMS_PROVIDER=console).</Text>
              </>
            )}

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
