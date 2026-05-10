import { Stack } from "expo-router";

export default function DeliveryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="delivery" options={{ headerShown: false }} />
      <Stack.Screen name="delivery-detail" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ headerShown: false }} />
      <Stack.Screen name="historico" options={{ headerShown: false }} />
      <Stack.Screen name="ganhos" options={{ headerShown: false }} />
    </Stack>
  );
}
