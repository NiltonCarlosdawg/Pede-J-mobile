import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { useColorScheme } from "@/components/useColorScheme";
import { useRef } from "react";
import { loadDemoSession } from "../src/services/demoAuth";
import "../src/services/sentry";
import { store, useAppDispatch, useAppSelector } from "../src/store";
import { clearSession, hydrateSession } from "../src/store/authSlice";

export {
    ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootLayoutNav loaded={loaded} />
      </Provider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav({ loaded }: { loaded: boolean }) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const session = await loadDemoSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        dispatch(hydrateSession(session));
      } else {
        dispatch(clearSession());
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNavContent isAuthenticated={Boolean(token)} />;
}

function RootLayoutNavContent({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const role = useAppSelector((state) => state.auth.role);
  const lastRedirectTarget = useRef<string | null>(null);

  useEffect(() => {
    const target =
      !isAuthenticated
        ? "/(auth)/login"
        : role === "delivery"
          ? "/delivery"
          : "/(tabs)";
    if (lastRedirectTarget.current !== target) {
      lastRedirectTarget.current = target;
      router.replace(target as never);
    }
  }, [isAuthenticated, role, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar 
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent={true}
      />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="restaurante" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="carrinho" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="pedidos" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="perfil" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="endereco" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="delivery" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
