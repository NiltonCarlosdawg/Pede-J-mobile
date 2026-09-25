import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from "expo-router";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, StatusBar, Text, View, Button } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: "Arvo" };


import { AnimatedSplashScreen } from "../src/components/ui/SplashScreen";
import { loadDemoSession, clearDemoSession, saveDemoSession, onSessionChange } from "../src/services/demoAuth";
import { authApi } from "../src/services/api";
import axios from 'axios';
import { initializeNotifications, setupNotificationListener } from "../src/services/notifications";
import { initializeVoip, maybeHandleVoipNotificationData } from "../src/services/voip";
import "../src/services/sentry";
import { store, useAppDispatch, useAppSelector } from "../src/store";
import { clearSession, hydrateSession } from "../src/store/authSlice";
import { addNotification } from "../src/store/notificationsSlice";
import { hydratePaymentMethods } from "../src/store/paymentMethodsSlice";
import { ThemeProvider } from "../src/hooks/useTheme";
import { useTheme } from "../src/hooks/useTheme";

export {
    ErrorBoundary
} from "expo-router";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2 },
    mutations: { retry: false },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Arvo-Regular": require("../assets/fonts/Arvo-Regular.ttf"),
    "Arvo-Bold": require("../assets/fonts/Arvo-Bold.ttf"),
    "Arvo-Italic": require("../assets/fonts/Arvo-Italic.ttf"),
    "Arvo-BoldItalic": require("../assets/fonts/Arvo-BoldItalic.ttf"),
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
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayoutNav />
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [bootError, setBootError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setBootError(false);
        const session = await loadDemoSession();
        if (session) {
          const { data } = await authApi.getProfile();
          if (!isMounted) return;
          const current = await loadDemoSession();
          if (current) await saveDemoSession({ ...current, user: data.user ?? data });
        } else if (isMounted) dispatch(clearSession());
        if (isMounted) setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
          await clearDemoSession();
          setIsLoading(false);
        } else {
          setBootError(true);
          await SplashScreen.hideAsync();
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch, attempt]);

  useEffect(() => onSessionChange(() => { queryClient.clear(); }), []);

  if (bootError) return <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
    <Text>Não foi possível verificar a sessão. Verifique a ligação e tente novamente.</Text>
    <Button title="Tentar novamente" onPress={() => setAttempt((value) => value + 1)} />
    <Button title="Entrar com outra conta" onPress={() => { void clearDemoSession().then(() => { setBootError(false); setIsLoading(false); }); }} />
  </View>;

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.token));
  const role = useAppSelector((state) => state.auth.role);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(hydratePaymentMethods());
    void initializeNotifications().catch(() => undefined);
    void initializeVoip().catch(() => undefined);
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login" as never);
      return;
    }
    let target: string;
    if (role === "delivery") target = "/(delivery)";
    else if (role === "restaurant") target = "/(restaurant)";
    else target = "/(tabs)";
    router.replace(target as never);
  }, [isAuthenticated, role]);

  // Listen for notifications and add them to the store (native only)
  useEffect(() => {
    if (Platform.OS === "web") return;

    const cleanup = setupNotificationListener((notification: any) => {
      const { title, body, data } = notification.request.content;
      maybeHandleVoipNotificationData(data);
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
        <Stack.Protected guard={isAuthenticated && role === 'client'}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="restaurante" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="carrinho" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="endereco" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="chat" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="avaliacao" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="avaliacao-entregador" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="payment-flow" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="promocoes" options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="produto-modal" options={{ headerShown: false, presentation: "modal" }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated && role === 'delivery'}>
        <Stack.Screen name="(delivery)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated && role === 'restaurant'}>
        <Stack.Screen name="(restaurant)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="notifications" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="call" options={{ headerShown: false, presentation: "fullScreenModal" }} />
        <Stack.Screen name="modal" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}
