import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { DemoRole } from "../../src/services/demoAuth";
import { useAppDispatch } from "../../src/store";
import { setSession } from "../../src/store/authSlice";
import { colors, spacing } from "../../src/theme";
import type { User } from "../../src/types";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const validateForm = () => {
    if (!name.trim()) {
      setError("Por favor preencha o nome completo.");
      return false;
    }

    if (!email.trim()) {
      setError("Por favor preencha o e-mail.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor insira um e-mail válido.");
      return false;
    }

    if (!password) {
      setError("Por favor preencha a senha.");
      return false;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
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
      // Demo registration - simulating a successful registration
      // In a real scenario, this would call the backend API
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
      router.replace("/(tabs)/");
    } catch (err) {
      console.error("[register] error:", err);
      setError("Não foi possível criar a conta. Tente novamente.");
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
        >
          <View style={styles.heroCard}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>
              Crie sua conta PedeJá e comece a pedir comida agora mesmo.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <Input
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
              icon="account"
              iconPosition="left"
              disabled={loading}
            />

            <Input
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="email"
              iconPosition="left"
              disabled={loading}
            />

            <Input
              placeholder="Telefone (opcional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="phone"
              iconPosition="left"
              disabled={loading}
            />

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
              Segurança
            </Text>

            <View style={styles.passwordWrapper}>
              <Input
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                icon="lock"
                iconPosition="left"
                disabled={loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral[700]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordWrapper}>
              <Input
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                icon="lock"
                iconPosition="left"
                disabled={loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((s) => !s)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.neutral[700]}
                />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={loading ? "A criar conta..." : "Crear conta"}
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.loginLink}>
              <Text style={styles.linkText}>Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.linkHighlight}>Entre aqui</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.termsCard}>
            <Text style={styles.termsText}>
              Ao criar uma conta, você concorda com nossos{" "}
              <Text style={styles.linkHighlight}>Termos de Serviço</Text> e{" "}
              <Text style={styles.linkHighlight}>Política de Privacidade</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  heroCard: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[700],
  },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.neutral[500],
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: 14,
    color: colors.neutral[700],
  },
  linkHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[500],
  },
  termsCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.neutral[700],
  },
});
