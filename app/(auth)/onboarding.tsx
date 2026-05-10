import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/ui/Button";
import { spacing } from "../../src/theme";
import { useTheme } from "../../src/hooks/useTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

const ONBOARDING_KEY = "@pedeja_onboarding_seen";

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const SLIDES: OnboardingSlide[] = [
    {
      id: "1",
      icon: "food-variant",
      iconColor: colors.primary[500],
      title: "Descubra Restaurantes",
      description:
        "Explore uma variedade de restaurantes e pratos deliciosos perto de você. De fast food a gourmet, temos tudo!",
    },
    {
      id: "2",
      icon: "truck-delivery",
      iconColor: colors.secondary[500],
      title: "Entrega Rápida",
      description:
        "Receba sua comida em minutos com nossos entregadores parceiros. Acompanhe tudo em tempo real.",
    },
    {
      id: "3",
      icon: "account-group",
      iconColor: colors.primary[500],
      title: "Seja um Parceiro",
      description:
        "Quer entregar ou vender? Junte-se a nós como entregador ou restaurante parceiro e comece a ganhar!",
    },
  ];

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(Number(viewableItems[0].index));
      }
    },
    []
  );

  function scrollToIndex(index: number) {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }

  async function handleComplete() {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
      // Silently fail
    }
    router.replace("/(auth)/profile-select");
  }

  function renderSlide({ item }: { item: OnboardingSlide }) {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: item.iconColor + "15" }]}>
          <MaterialCommunityIcons
            name={item.icon as any}
            size={64}
            color={item.iconColor}
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  }

  function renderPagination() {
    return (
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const dotColor = scrollX.interpolate({
            inputRange,
            outputRange: [
              colors.neutral[300],
              colors.primary[500],
              colors.neutral[300],
            ],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                { width: dotWidth, backgroundColor: dotColor },
              ]}
            />
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Skip button */}
      <View style={styles.header}>
        <Pressable onPress={handleComplete} style={styles.skipButton}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={32}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttons}>
          {currentIndex < SLIDES.length - 1 ? (
            <Button
              title="Próximo"
              onPress={() => scrollToIndex(currentIndex + 1)}
            />
          ) : (
            <Button title="Começar" onPress={handleComplete} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    skipButton: {
      padding: spacing.sm,
    },
    skipText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.neutral[500],
    },
    slide: {
      width: SCREEN_WIDTH,
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.onSurface,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    description: {
      fontSize: 16,
      color: colors.neutral[500],
      textAlign: "center",
      lineHeight: 24,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      gap: spacing.lg,
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.sm,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    buttons: {
      width: "100%",
    },
  });
}
