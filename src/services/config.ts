export function validateApiUrl(value: string | undefined, development: boolean): string {
  if (!value) {
    if (development) return 'http://localhost:3000/v1';
    throw new Error('Configure EXPO_PUBLIC_API_URL para esta versão da aplicação.');
  }
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash ||
      (url.protocol !== 'https:' && !(development && url.protocol === 'http:'))) {
    throw new Error('A API deve usar HTTPS e não pode conter credenciais, query ou fragmento.');
  }
  return value.replace(/\/+$/, '');
}

let cachedApiUrl: string | null = null;
export function getApiUrl(): string {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    cachedApiUrl = validateApiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__);
    return cachedApiUrl;
  } catch (error) {
    if (__DEV__) {
      console.warn('[config] API_URL inválida, usando fallback local:', (error as Error).message);
      cachedApiUrl = 'http://localhost:3000/v1';
      return cachedApiUrl;
    }
    throw error;
  }
}

export const API_URL = getApiUrl();
