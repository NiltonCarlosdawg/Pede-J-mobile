import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/ui/Button';
import {
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useLazyGetOtpDevCodeQuery,
} from '../../src/hooks/useApi';
import { saveSession, roleFromUser } from '../../src/services/session';
import { useAppDispatch } from '../../src/store';
import { setSession } from '../../src/store/authSlice';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));
  const dispatch = useAppDispatch();
  const [loginMutation] = useLoginMutation();
  const [requestOtpMutation] = useRequestOtpMutation();
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [fetchOtpDevCode] = useLazyGetOtpDevCodeQuery();

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
          justifyContent: 'flex-start',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        },
        logoSection: {
          alignItems: 'center',
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
        formCard: {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
          borderRadius: 24,
          padding: spacing.lg,
          gap: spacing.md,
        },
        inputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
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
          position: 'absolute',
          right: spacing.md,
          height: '100%',
          justifyContent: 'center',
        },
        errorText: {
          color: colors.error,
          fontSize: 13,
          fontWeight: '600',
          textAlign: 'center',
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.xs,
        },
        footerText: {
          fontSize: 14,
          color: colors.neutral[500],
        },
        footerLink: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.primary[500],
        },
      }),
    [colors],
  );

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
      setError('Preencha o email e a senha.');
      triggerShake();
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Por favor, insira um email válido.');
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { token, refreshToken, user } = await loginMutation({
        identificador: normalizedEmail,
        password,
      }).unwrap();
      const sessionRole = roleFromUser(user);

      await saveSession({ token, refreshToken, user, role: sessionRole });
      dispatch(setSession({ token, user, role: sessionRole }));
    } catch (loginError: any) {
      // Erro normalizado pelo RTK Query: { status, data: { message, ... } }
      const data = loginError?.data;
      const code = data?.code;
      const message = data?.message || 'Email ou senha incorretos.';
      if (code === 'PHONE_NOT_VERIFIED') {
        setError('Conta ainda não verificada. A confirmar automaticamente...');
        try {
          await requestOtpMutation({ telefone: normalizedEmail })
            .unwrap()
            .catch(() => requestOtpMutation({ telefone: email.trim() }).unwrap());
        } catch {}
        // tenta verificar via dev-code se estiver em dev
        if (__DEV__) {
          try {
            const tel = email.trim();
            const devCodigo = await fetchOtpDevCode({ telefone: tel })
              .unwrap()
              .then((d) => d?.codigo)
              .catch(() => undefined);
            if (devCodigo) {
              const verifyRes = await verifyOtpMutation({
                telefone: tel,
                codigo: devCodigo,
              }).unwrap();
              const { token: t, refreshToken: rt, user: u } = verifyRes;
              const sRole = roleFromUser(u);
              await saveSession({ token: t, refreshToken: rt, user: u, role: sRole });
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              source={require('../../assets/images/P.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Entre e aproveite</Text>
          </View>


          {/* Formulário */}
          <Animated.View style={[styles.formCard, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.neutral[500]}
                style={styles.inputIcon}
              />
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
                onPress={() => setShowPassword((value) => !value)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.neutral[500]}
                />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title={loading ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
            />
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
