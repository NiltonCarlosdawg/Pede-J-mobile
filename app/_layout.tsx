import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { useColorScheme } from "@/components/useColorScheme";
import { AnimatedSplashScreen } from "../src/components/ui/SplashScreen";
import { loadDemoSession } from "../src/services/demoAuth";
import { initializeNotifications, setupNotificationListener } from "../src/services/notifications";
import "../src/services/sentry";
import { store, useAppDispatch, useAppSelector } from "../src/store";
import { clearSession, hydrateSession } from "../src/store/authSlice";
import { addNotification } from "../src/store/notificationsSlice";
import { ThemeProvider } from "../src/hooks/useTheme";
import { useTheme } from "../src/hooks/useTheme";

export {
    ErrorBoundary
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <ThemeProvider>
          <RootLayoutNav />
        </ThemeProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      // Initialize notifications
      await initializeNotifications();

      const session = await loadDemoSession();

      if (!isMounted) return;

      if (session) {
        dispatch(hydrateSession(session));
      } else {
        dispatch(clearSession());
      }

      setIsLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const isReady = !isLoading && initialized;

  const handleSplashComplete = () => {
    setShowSplash(false);
    SplashScreen.hideAsync();
  };

  return (
    <>
      {showSplash && (
        <AnimatedSplashScreen
          isReady={isReady}
          onComplete={handleSplashComplete}
        />
      )}
      {!showSplash && <RootLayoutNavContent />}
    </>
  );
}

function RootLayoutNavContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  const role = useAppSelector((state) => state.auth.role);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login" as never);
      return;
    }

    const target = role === "delivery" ? "/(delivery)/delivery" : "/(tabs)";
    router.replace(target as never);
  }, [isAuthenticated, role]);

  // Listen for notifications and add them to the store (native only)
  useEffect(() => {
    if (Platform.OS === "web") return;

    const cleanup = setupNotificationListener((notification: any) => {
      const { title, body, data } = notification.request.content;
      dispatch(
        addNotification({
          id: notification.request.identifier,
          type: (data?.type as any) || "system",
          title: title || "Notificação",
          body: body || "",
          data: data || {},
          read: false,
          createdAt: new Date().toISOString(),
        })
      );
    });

    return cleanup;
  }, [dispatch]);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="restaurante" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="carrinho" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="pedidos" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="perfil" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="endereco" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="chat" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="avaliacao" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="delivery" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
