import AsyncStorage from "@react-native-async-storage/async-storage";

const memoryStorage: Record<string, string> = {};

/**
 * O import acima só resolve se o módulo existir no bundle; se este módulo
 * carregou, o módulo nativo está disponível. Mantido como função para
 * centralizar a decisão caso passe a exigir verificação em runtime.
 */
function checkNativeModule(): boolean {
  return true;
}

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

