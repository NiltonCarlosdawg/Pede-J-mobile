import AsyncStorage from "@react-native-async-storage/async-storage";

let isNativeModuleAvailable = true;

function checkNativeModule() {
  if (!isNativeModuleAvailable) return false;
  try {
    // Testa se o módulo nativo está disponível
    AsyncStorage.getItem("test");
    return true;
  } catch (error) {
    console.warn("[AsyncStorage] Native module unavailable, using memory fallback");
    isNativeModuleAvailable = false;
    return false;
  }
}

const memoryStorage: Record<string, string> = {};

export async function safeGetItem(key: string): Promise<string | null> {
  try {
    if (checkNativeModule()) {
      return await AsyncStorage.getItem(key);
    }
  } catch {
    // Silently fail
  }
  return memoryStorage[key] ?? null;
}

export async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    if (checkNativeModule()) {
      await AsyncStorage.setItem(key, value);
      return;
    }
  } catch {
    // Silently fail
  }
  memoryStorage[key] = value;
}

export async function safeRemoveItem(key: string): Promise<void> {
  try {
    if (checkNativeModule()) {
      await AsyncStorage.removeItem(key);
      return;
    }
  } catch {
    // Silently fail
  }
  delete memoryStorage[key];
}


