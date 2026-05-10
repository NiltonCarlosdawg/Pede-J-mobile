import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { DemoRole } from "../../src/services/demoAuth";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

export default function ProfileSelectScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedRole, setSelectedRole] = useState<DemoRole | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    header: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.onSurface,
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.neutral[500],
      textAlign: "center",
      lineHeight: 22,
    },
    cardsContainer: {
      flex: 1,
      gap: spacing.md,
      justifyContent: "center",
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: colors.surfaceVariant,
      overflow: "hidden",
    },
    cardSelected: {
      borderColor: colors.primary[500],
      backgroundColor: colors.primary[100],
    },
    cardContent: {
      padding: spacing.lg,
      alignItems: "center",
      position: "relative",
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    iconContainerSelected: {
      backgroundColor: colors.primary[500],
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.onSurface,
      marginBottom: spacing.xs,
      textAlign: "center",
    },
    cardDescription: {
      fontSize: 14,
      color: colors.neutral[500],
      textAlign: "center",
      lineHeight: 20,
    },
    checkBadge: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
    },
    footer: {
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    hint: {
      fontSize: 12,
      color: colors.neutral[500],
      textAlign: "center",
      lineHeight: 18,
    },
  }), [colors]);

  function animatePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handleSelect(role: DemoRole) {
    animatePress();
    setSelectedRole(role);
  }

  function handleContinue() {
    if (selectedRole) {
      router.push({
        pathname: "/(auth)/login",
        params: { role: selectedRole },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="food-variant"
              size={48}
              color={colors.primary[500]}
            />
          </View>
          <Text style={styles.title}>Bem-vindo ao PedeJá</Text>
          <Text style={styles.subtitle}>
            Escolha como deseja usar o aplicativo
          </Text>
        </View>

        {/* Cards de seleção */}
        <View style={styles.cardsContainer}>
          <Pressable
            onPress={() => handleSelect("client")}
            style={[
              styles.card,
              selectedRole === "client" && styles.cardSelected,
            ]}
          >
            <Animated.View
              style={[
                styles.cardContent,
                selectedRole === "client" && { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  selectedRole === "client" && styles.iconContainerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={32}
                  color={
                    selectedRole === "client"
                      ? colors.white
                      : colors.primary[500]
                  }
                />
              </View>
              <Text style={styles.cardTitle}>Quero pedir comida</Text>
              <Text style={styles.cardDescription}>
                Explore restaurantes, faça pedidos e acompanhe entregas
              </Text>
              {selectedRole === "client" && (
                <View style={styles.checkBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.primary[500]}
                  />
                </View>
              )}
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={() => handleSelect("delivery")}
            style={[
              styles.card,
              selectedRole === "delivery" && styles.cardSelected,
            ]}
          >
            <Animated.View
              style={[
                styles.cardContent,
                selectedRole === "delivery" && { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  selectedRole === "delivery" && styles.iconContainerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name="motorbike"
                  size={32}
                  color={
                    selectedRole === "delivery"
                      ? colors.white
                      : colors.secondary[500]
                  }
                />
              </View>
              <Text style={styles.cardTitle}>Quero fazer entregas</Text>
              <Text style={styles.cardDescription}>
                Aceite pedidos, visualize rotas e ganhe dinheiro
              </Text>
              {selectedRole === "delivery" && (
                <View style={styles.checkBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.secondary[500]}
                  />
                </View>
              )}
            </Animated.View>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            disabled={!selectedRole}
            loading={false}
          />
          <Text style={styles.hint}>
            Você pode alterar esta opção posteriormente nas configurações
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
