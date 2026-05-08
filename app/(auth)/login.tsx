import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { clearSession, setSession } from "../../src/store/authSlice";
import { useAppDispatch } from "../../src/store";
import {
  createDemoSession,
  DEMO_LOGIN,
  clearDemoSession,
  DemoRole,
  saveDemoSession,
} from "../../src/services/demoAuth";
import { colors, spacing } from "../../src/theme";

export default function LoginScreen() {
  const [role, setRole] = useState<DemoRole>("client");
  const [email, setEmail] = useState(DEMO_LOGIN.client.email);
  const [password, setPassword] = useState(DEMO_LOGIN.client.password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const credentials = useMemo(() => {
    return role === "delivery" ? DEMO_LOGIN.delivery : DEMO_LOGIN.client;
  }, [role]);

  function syncCredentials(nextRole: DemoRole) {
    setRole(nextRole);
    const nextCredentials =
      nextRole === "delivery" ? DEMO_LOGIN.delivery : DEMO_LOGIN.client;
    setEmail(nextCredentials.email);
    setPassword(nextCredentials.password);
    setError(null);
    setShowPassword(false);
  }

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    console.log("[demo-auth] login pressed", {
      role,
      email: normalizedEmail,
    });

    if (!normalizedEmail || !password) {
      setError("Preencha o email e a senha da conta de demonstração.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const session = createDemoSession(role);
      await saveDemoSession(session);
      console.log("[demo-auth] session saved", {
        role: session.role,
        userId: session.user.id,
      });
      dispatch(setSession(session));
    } catch (loginError) {
      console.error("[demo-auth] login failed", loginError);
      setError("Não foi possível iniciar a sessão de demonstração.");
    } finally {
      setLoading(false);
    }
  }

  function handleFillDemo() {
    const nextCredentials =
      role === "delivery" ? DEMO_LOGIN.delivery : DEMO_LOGIN.client;

    setEmail(nextCredentials.email);
    setPassword(nextCredentials.password);
    setError(null);
  }

  async function handleClearDemo() {
    await clearDemoSession();
    setEmail("");
    setPassword("");
    setError(null);
    dispatch(clearSession());
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>PedeJá demo</Text>
          <Text style={styles.title}>Entrar na experiência de demonstração</Text>
          <Text style={styles.subtitle}>
            Sem backend por enquanto. Escolhe uma conta demo local para navegar
            no app.
          </Text>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleTextBlock}>
            <Text style={styles.sectionTitle}>Conta ativa</Text>
            <Text style={styles.toggleLabel}>
              {role === "delivery" ? "Switch to delivery account" : "Switch to client account"}
            </Text>
            <Text style={styles.toggleCaption}>
              {role === "delivery"
                ? "A interface será aberta como entregador."
                : "A interface será aberta como cliente."}
            </Text>
          </View>
          <Switch
            value={role === "delivery"}
            onValueChange={(value) => syncCredentials(value ? "delivery" : "client")}
            trackColor={{ false: colors.primary[100], true: colors.secondary[100] }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Credenciais</Text>

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

          <View style={styles.passwordContainer}>
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
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.neutral[700]}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title={loading ? "A entrar..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
          />

          <View style={styles.secondaryActions}>
            <Button
              title="Preencher demo"
              onPress={handleFillDemo}
              variant="secondary"
              size="small"
              disabled={loading}
            />
            <Button
              title="Limpar"
              onPress={handleClearDemo}
              variant="ghost"
              size="small"
              disabled={loading}
            />
          </View>
        </View>

        <View style={styles.hintCard}>
          <Text style={styles.hintLabel}>Acesso de teste</Text>
          <Text style={styles.hintValue}>{credentials.email}</Text>
          <Text style={styles.hintValue}>{credentials.password}</Text>
          <Text style={styles.hintCaption}>
            A conta demo é guardada localmente e pode ser removida com "Limpar".
          </Text>
        </View>
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
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  heroCard: {
    backgroundColor: colors.primary[100],
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary[100],
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.neutral[700],
  },
  toggleCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toggleTextBlock: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onSurface,
    marginTop: spacing.xs,
  },
  toggleCaption: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral[700],
  },
  formCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.neutral[500],
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 16,
    padding: spacing.md,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingRight: 44,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  hintCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  hintValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.onSurface,
  },
  hintCaption: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral[700],
  },
});
