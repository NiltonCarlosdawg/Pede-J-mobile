import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/ui/Button";
import { Header } from "../src/components/ui/Header";
import { useAppDispatch, useAppSelector } from "../src/store";
import { selectOrders } from "../src/store/ordersSlice";
import { createPaymentTransaction, updateTransactionStatus } from "../src/store/paymentMethodsSlice";
import { spacing, typography } from "../src/theme";
import { useTheme } from "../src/hooks/useTheme";
import { formatPrice } from "../src/theme";
import { PaymentMethod } from "../src/types";
import { playPaymentSuccess } from "../src/utils/sounds";

export default function PaymentFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string; methodId?: string }>();
  const orderId = params.orderId ?? "";
  const methodId = params.methodId ?? "";
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const order = orders.find((o) => o.id === orderId);

  const paymentMethod = order?.payment as PaymentMethod | undefined;
  const [step, setStep] = useState<'confirm' | 'phone' | 'processing' | 'awaiting' | 'success'>('confirm');
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(180);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isFacipay = paymentMethod?.type === "facipay";
  const isMulticaixa = paymentMethod?.type === "multicaixa_express";

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    orderInfo: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 20,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    orderLabel: { ...typography.bodySm, color: colors.neutral[500], marginBottom: spacing.xs },
    orderValue: { ...typography.labelLg, color: colors.onSurface, fontWeight: "800" },
    totalValue: { ...typography.h2, color: colors.primary[500], fontWeight: "800", marginTop: spacing.sm },
    methodInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surfaceContainer,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    methodIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
    },
    methodName: { ...typography.labelLg, color: colors.onSurface, fontWeight: "700" },
    methodDesc: { ...typography.bodySm, color: colors.neutral[500], marginTop: 2 },
    sectionTitle: { ...typography.h3, color: colors.onSurface, marginBottom: spacing.md },
    description: { ...typography.bodySm, color: colors.neutral[600], marginBottom: spacing.lg, lineHeight: 22 },
    input: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 18,
      color: colors.onSurface,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      marginBottom: spacing.md,
    },
    pinInput: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 16,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontSize: 24,
      color: colors.onSurface,
      textAlign: "center",
      letterSpacing: 8,
      fontWeight: "700",
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      marginBottom: spacing.md,
    },
    errorText: { color: colors.error, ...typography.bodySm, textAlign: "center", marginBottom: spacing.sm },
    processingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    processingText: { ...typography.h3, color: colors.onSurface, marginTop: spacing.lg, marginBottom: spacing.sm },
    processingSubtext: { ...typography.bodySm, color: colors.neutral[500], textAlign: "center" },
    awaitingContainer: {
      flex: 1,
      alignItems: "center",
      padding: spacing.xl,
      paddingTop: spacing.xxl,
    },
    pulseCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    timerText: { ...typography.h3, color: colors.primary[500], marginTop: spacing.md, fontWeight: "800" },
    awaitingTitle: { ...typography.h3, color: colors.onSurface, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: "center" },
    awaitingSubtext: { ...typography.bodySm, color: colors.neutral[500], textAlign: "center", lineHeight: 20 },
    stepsList: {
      marginTop: spacing.lg,
      gap: spacing.md,
      width: "100%",
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
    },
    stepItemActive: {
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[50],
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumberText: { color: colors.white, fontSize: 13, fontWeight: "800" },
    stepText: { ...typography.bodySm, color: colors.onSurface, fontWeight: "600", flex: 1 },
    successContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xl,
    },
    successIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    successTitle: { ...typography.h2, color: colors.onSurface, marginBottom: spacing.sm, fontWeight: "800" },
    successText: { ...typography.bodySm, color: colors.neutral[500], textAlign: "center", marginBottom: spacing.xl },
  }), [colors]);

  useEffect(() => {
    if (step === "awaiting" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  useEffect(() => {
    if (step === "success") {
      playPaymentSuccess();
    }
  }, [step]);

  useEffect(() => {
    if (step === "awaiting") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();

      const randomDelay = Math.floor(Math.random() * 20000) + 5000;
      const timeout = setTimeout(() => {
        setStep("success");
        dispatch(updateTransactionStatus({
          transactionId: `tx-${Date.now()}`,
          status: "completed",
          completedAt: new Date().toISOString(),
        }));
      }, randomDelay);

      return () => clearTimeout(timeout);
    }
  }, [step]);

  function handleConfirm() {
    if (!paymentMethod) return;

    if (paymentMethod.type === "multicaixa_express" || paymentMethod.type === "facipay") {
      setStep("phone");
      return;
    }

    dispatch(createPaymentTransaction({
      orderId,
      methodType: paymentMethod.type,
      amount: order?.total ?? 0,
      status: "pending",
    }));

    setStep("processing");
    simulatePaymentProcessing();
  }

  const ENTITY_CODE = "90001";
  const ENTITY_NAME = "PedeJá Lda";

  function handlePhoneSubmit() {
    if (phone.length < 9) {
      setError("Número de telefone inválido");
      return;
    }
    setError("");
    
    const amount = order?.total ?? 0;
    
    dispatch(createPaymentTransaction({
      orderId,
      methodType: paymentMethod?.type ?? "multicaixa_express",
      amount,
      status: "processing",
    }));

    setStep("processing");
    
    setTimeout(() => {
      setStep("awaiting");
      setTimer(180);
    }, 2000);
  }

  function simulatePaymentProcessing() {
    setTimeout(() => {
      setStep("success");
      const tx = { transactionId: `tx-${Date.now()}`, status: "completed" as const, completedAt: new Date().toISOString() };
      dispatch(updateTransactionStatus(tx));
    }, 3000);
  }

  function handlePinConfirm() {
    if (pin.length < 4) {
      setError("PIN deve ter pelo menos 4 dígitos");
      return;
    }
    setError("");
    setStep("processing");
    simulatePaymentProcessing();
  }

  function formatTimer(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function renderConfirmStep() {
    return (
      <>
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>{formatPrice(order?.total ?? 0)}</Text>
        </View>

        <View style={styles.methodInfo}>
          <View style={styles.methodIcon}>
            <MaterialCommunityIcons 
              name={paymentMethod?.type === "multicaixa_express" ? "bank-transfer" : "wallet"} 
              size={24} 
              color={colors.primary[500]} 
            />
          </View>
          <View>
            <Text style={styles.methodName}>{paymentMethod?.label}</Text>
            <Text style={styles.methodDesc}>{getMethodDescription()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Confirme o pagamento</Text>
        <Text style={styles.description}>{getMethodDescription()}</Text>

        {(paymentMethod?.type === "paypay" || paymentMethod?.type === "unitel_money") && (
          <>
            <Text style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: spacing.sm }}>
              Insira o PIN de confirmação
            </Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/[^0-9]/g, "").slice(0, 6));
                setError("");
              }}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              placeholder="••••"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        )}

        <Button
          title={paymentMethod?.type === "multicaixa_express" || paymentMethod?.type === "facipay" ? "Continuar" : "Confirmar Pagamento"}
          onPress={paymentMethod?.type === "multicaixa_express" || paymentMethod?.type === "facipay" ? handleConfirm : handlePinConfirm}
          disabled={
            (paymentMethod?.type !== "multicaixa_express" && paymentMethod?.type !== "facipay" && pin.length < 4) ||
            !paymentMethod
          }
        />
      </>
    );
  }

  function renderPhoneStep() {
    const isFacipay = paymentMethod?.type === "facipay";
    
    return (
      <>
        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>{formatPrice(order?.total ?? 0)}</Text>
        </View>

        <View style={styles.methodInfo}>
          <View style={styles.methodIcon}>
            <MaterialCommunityIcons 
              name={isFacipay ? "cellphone" : "bank-transfer"} 
              size={24} 
              color={colors.primary[500]} 
            />
          </View>
          <View>
            <Text style={styles.methodName}>{isFacipay ? "FaciPay" : "Multicaixa Express"}</Text>
            <Text style={styles.methodDesc}>
              {isFacipay ? "Pagamento direto via app FaciPay" : "Pagamento via notificação push"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Número de telefone</Text>
        <Text style={styles.description}>
          {isFacipay 
            ? "Insira o número de telefone associado à sua conta FaciPay. Vamos abrir o app FaciPay para você confirmar o pagamento."
            : "Insira o número de telefone associado à sua conta Multicaixa Express. Você receberá uma notificação no aplicativo do seu banco para confirmar o pagamento."
          }
        </Text>

        <Text style={{ ...typography.labelLg, color: colors.neutral[700], marginBottom: spacing.sm }}>
          Telemóvel (Ex: 923456789)
        </Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={(text) => {
            const numeric = text.replace(/[^0-9]/g, "").slice(0, 9);
            setPhone(numeric);
            setError("");
          }}
          keyboardType="numeric"
          maxLength={9}
          placeholder="923456789"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={isFacipay ? "Abrir FaciPay e Confirmar" : "Enviar pedido de pagamento"}
          onPress={handlePhoneSubmit}
          disabled={phone.length < 9}
        />

        <Text style={{ ...typography.bodySm, color: colors.neutral[500], marginTop: spacing.lg, textAlign: "center" }}>
          {isFacipay 
            ? "Será aberto o app FaciPay para confirmação do pagamento"
            : "Será enviado um pedido de pagamento via EMIS (Multicaixa Express)"
          }
        </Text>
      </>
    );
  }

  function renderProcessingStep() {
    const isMulticaixa = paymentMethod?.type === "multicaixa_express";
    const isFacipay = paymentMethod?.type === "facipay";
    
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.processingText}>A processar...</Text>
        <Text style={styles.processingSubtext}>
          {isMulticaixa 
            ? "A enviar pedido de pagamento via EMIS..." 
            : isFacipay
            ? "A preparar pagamento no app FaciPay..."
            : "Por favor aguarde enquanto confirmamos a transação com " + paymentMethod?.label}
        </Text>
        
        {(isMulticaixa || isFacipay) && (
          <View style={{ marginTop: spacing.lg, width: "100%", paddingHorizontal: spacing.md }}>
            <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant }}>
              <Text style={{ ...typography.labelCaps, color: colors.neutral[500], marginBottom: spacing.sm }}>
                {isFacipay ? "REQUISIÇÃO FACIPAY" : "REQUISIÇÃO EMIS"}
              </Text>
              <View style={{ gap: spacing.xs }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Entidade</Text>
                  <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.onSurface }}>{ENTITY_CODE} - {ENTITY_NAME}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Valor</Text>
                  <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.onSurface }}>{formatPrice(order?.total ?? 0)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Telemóvel</Text>
                  <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.onSurface }}>+244 {phone}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: colors.surfaceVariant, marginVertical: spacing.xs }} />
                <Text style={{ ...typography.bodySm, color: colors.primary[500], textAlign: "center", fontWeight: "600" }}>
                  {isFacipay ? "Aguardando confirmação no app FaciPay..." : "Aguardando resposta do Multicaixa Express..."}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  function renderAwaitingStep() {
    const isFacipay = paymentMethod?.type === "facipay";
    
    return (
      <View style={styles.awaitingContainer}>
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="cellphone-message" size={40} color={colors.primary[500]} />
        </Animated.View>

        <Text style={styles.awaitingTitle}>Aguardando confirmação</Text>
        <Text style={styles.awaitingSubtext}>
          {isFacipay 
            ? "Abra o app FaciPay e confirme o pagamento.\nAssim que confirmar, voltaremos automaticamente."
            : "Um pedido de pagamento foi enviado para o seu telemóvel.\nConfirme a transação no aplicativo do seu banco."
          }
        </Text>

        <Text style={styles.timerText}>{formatTimer(timer)}</Text>
        <Text style={{ ...typography.bodySm, color: colors.neutral[500], marginTop: spacing.xs }}>
          Expira em 3 minutos
        </Text>

        <View style={{ marginTop: spacing.lg, width: "100%", paddingHorizontal: spacing.sm }}>
          <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: spacing.md, borderWidth: 1, borderColor: colors.surfaceVariant, marginBottom: spacing.lg }}>
            <Text style={{ ...typography.labelCaps, color: colors.neutral[500], marginBottom: spacing.sm }}>
              {isFacipay ? "DETALHES DO PEDIDO FACIPAY" : "DETALHES DO PEDIDO EMIS"}
            </Text>
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Entidade</Text>
                <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.onSurface }}>{ENTITY_CODE} - {ENTITY_NAME}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Valor</Text>
                <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.primary[500] }}>{formatPrice(order?.total ?? 0)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ ...typography.bodySm, color: colors.neutral[600] }}>Telemóvel</Text>
                <Text style={{ ...typography.bodySm, fontWeight: "700", color: colors.onSurface }}>+244 {phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stepsList}>
          <View style={[styles.stepItem, styles.stepItemActive]}>
            <View style={styles.stepNumber}>
              <MaterialCommunityIcons name="check" size={16} color={colors.white} />
            </View>
            <Text style={styles.stepText}>
              {isFacipay ? "Pedido enviado para app FaciPay" : "Pedido enviado via EMIS"}
            </Text>
          </View>

          <View style={[styles.stepItem, timer < 170 ? styles.stepItemActive : {}]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              {isFacipay ? "Notificação recebida no FaciPay" : "Notificação recebida no app do banco"}
            </Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Confirme o pagamento no app</Text>
          </View>
        </View>

        <Text style={{ ...typography.bodySm, color: colors.neutral[500], marginTop: spacing.lg, textAlign: "center", fontStyle: "italic" }}>
          {isFacipay ? "A aprovação será recebida automaticamente do FaciPay" : "A aprovação será recebida automaticamente do Multicaixa Express"}
        </Text>
      </View>
    );
  }

  function renderSuccessStep() {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons name="check" size={40} color={colors.primary[500]} />
        </View>
        <Text style={styles.successTitle}>Pagamento Confirmado!</Text>
        <Text style={styles.successText}>
          O pagamento de {formatPrice(order?.total ?? 0)} via {paymentMethod?.label} foi processado com sucesso.
        </Text>
        <Button
          title="Ver Pedido"
          onPress={() => router.replace({ pathname: "/(auth)/order-success", params: { orderId, total: String(order?.total) } })}
        />
      </View>
    );
  }

  function getMethodDescription() {
    switch (paymentMethod?.type) {
      case "paypay":
        return "O pagamento será debitado da sua carteira PayPay. Insira o PIN de confirmação.";
      case "multicaixa_express":
        return "Você receberá uma notificação no app do seu banco para confirmar o pagamento.";
      case "unitel_money":
        return "O pagamento será debitado da sua carteira Unitel Money. Insira o PIN de confirmação.";
      case "facipay":
        return "Abra o app FaciPay no seu telemóvel e confirme o pagamento.";
      default:
        return "Confirme o pagamento do seu pedido.";
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="Pagamento" showBack onBackPress={() => router.back()} />
      <View style={styles.content}>
        {step === "confirm" && renderConfirmStep()}
        {step === "phone" && renderPhoneStep()}
        {step === "processing" && renderProcessingStep()}
        {step === "awaiting" && renderAwaitingStep()}
        {step === "success" && renderSuccessStep()}
      </View>
    </SafeAreaView>
  );
}
