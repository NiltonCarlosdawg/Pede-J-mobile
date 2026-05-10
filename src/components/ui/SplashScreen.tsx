import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors, spacing } from "../../theme";

interface SplashScreenProps {
  isReady: boolean;
  onComplete: () => void;
}

export function AnimatedSplashScreen({ isReady, onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada do logo
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      // Delay antes de mostrar o texto
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();
  }, []);

  useEffect(() => {
    // Animação de pulso contínua do logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    if (isReady && isVisible) {
      const timer = setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onComplete();
        });
      }, 3800);

      return () => clearTimeout(timer);
    }
  }, [isReady, isVisible]);

  if (!isVisible) {
    return null;
  }

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: containerOpacity }
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: spin },
              ],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image
              source={require("../../../assets/images/P.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>PedeJá</Text>
          <Text style={styles.subtitle}>Comida deliciosa, entrega rápida</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: loadingOpacity }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotDelay]} />
          <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 180,
    height: 180,
    borderRadius: 40,
  },
  textContainer: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: spacing.xxl,
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    opacity: 0.4,
  },
  loadingDotDelay: {
    opacity: 0.7,
  },
  loadingDotDelay2: {
    opacity: 1,
  },
});
