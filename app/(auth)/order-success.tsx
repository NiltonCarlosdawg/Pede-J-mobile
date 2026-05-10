import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Button } from "../../src/components/ui/Button";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OrderSuccessScreenProps {
  orderId?: string;
  total?: number;
}

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(50)).current;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    circleContainer: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
    },
    circleOuter: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 80,
      backgroundColor: colors.primary[100],
      opacity: 0.5,
      transform: [{ scale: 1.2 }],
    },
    circleInner: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary[500],
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    checkmarkContainer: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.onSurface,
      marginBottom: spacing.sm,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: colors.neutral[500],
      textAlign: "center",
      marginBottom: spacing.sm,
      lineHeight: 22,
    },
    description: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
      lineHeight: 20,
    },
    orderCard: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceVariant,
      width: "100%",
      gap: spacing.md,
    },
    orderInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    orderInfoContent: {
      flex: 1,
    },
    orderInfoLabel: {
      fontSize: 13,
      color: colors.neutral[500],
      marginBottom: 2,
    },
    orderInfoValue: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
    },
    divider: {
      height: 1,
      backgroundColor: colors.surfaceVariant,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    secondaryButton: {
      alignItems: "center",
      paddingVertical: spacing.md,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.neutral[500],
    },
  }), [colors]);

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 500,
        easing: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Confetti / Celebration Circle */}
        <Animated.View
          style={[
            styles.circleContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.circleOuter} />
          <View style={styles.circleInner} />
          <Animated.View
            style={[
              styles.checkmarkContainer,
              { transform: [{ scale: checkmarkScale }] },
            ]}
          >
            <MaterialCommunityIcons
              name="check-bold"
              size={64}
              color={colors.white}
            />
          </Animated.View>
        </Animated.View>

        {/* Success Text */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textOpacity },
          ]}
        >
          <Text style={styles.title}>Pedido Confirmado!</Text>
          <Text style={styles.subtitle}>
            Seu pedido foi recebido e está sendo preparado.
          </Text>
          <Text style={styles.description}>
            Você receberá atualizações sobre o status do seu pedido em breve.
          </Text>
        </Animated.View>

        {/* Order Info Card */}
        <Animated.View
          style={[
            styles.orderCard,
            { opacity: textOpacity },
          ]}
        >
          <View style={styles.orderInfoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary[500]} />
            <View style={styles.orderInfoContent}>
              <Text style={styles.orderInfoLabel}>Tempo estimado</Text>
              <Text style={styles.orderInfoValue}>30-45 minutos</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderInfoRow}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={20} color={colors.primary[500]} />
            <View style={styles.orderInfoContent}>
              <Text style={styles.orderInfoLabel}>Status</Text>
              <Text style={styles.orderInfoValue}>Preparando seu pedido</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.footer,
          { transform: [{ translateY: buttonTranslate }] },
        ]}
      >
        <Button
          title="Acompanhar Pedido"
          onPress={() => router.replace("/pedidos")}
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.secondaryButtonText}>Voltar ao início</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
