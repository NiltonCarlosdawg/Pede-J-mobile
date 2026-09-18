import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";
import type { User } from "../types";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
const AUTH_ROLE_KEY = "sessionRole";

export type DemoRole = "client" | "delivery" | "restaurant";

let memorySession: DemoSession | null = null;

export type DemoSession = {
  token: string;
  user: User;
  role: DemoRole;
};

export async function loadDemoSession(): Promise<DemoSession | null> {
  if (memorySession) {
    return memorySession;
  }

  try {
    const [token, userJson, role] = await Promise.all([
      safeGetItem(AUTH_TOKEN_KEY),
      safeGetItem(AUTH_USER_KEY),
      safeGetItem(AUTH_ROLE_KEY),
    ]);

    if (!token || !userJson || !role) {
      return null;
    }

    if (role !== "client" && role !== "delivery" && role !== "restaurant") {
      return null;
    }

    const user = JSON.parse(userJson) as User;
    memorySession = { token, user, role };
    return memorySession;
  } catch (error) {
    console.warn("[demo-auth] storage unavailable, using memory session", error);
    return memorySession;
  }
}

export async function saveDemoSession(session: DemoSession) {
  memorySession = session;

  try {
    await Promise.all([
      safeSetItem(AUTH_TOKEN_KEY, session.token),
      safeSetItem(AUTH_USER_KEY, JSON.stringify(session.user)),
      safeSetItem(AUTH_ROLE_KEY, session.role),
    ]);
  } catch (error) {
    console.warn("[demo-auth] falling back to in-memory storage", error);
  }
}

export async function clearDemoSession() {
  memorySession = null;

  try {
    await Promise.all([
      safeRemoveItem(AUTH_TOKEN_KEY),
      safeRemoveItem(AUTH_USER_KEY),
      safeRemoveItem(AUTH_ROLE_KEY),
    ]);
  } catch (error) {
    console.warn("[demo-auth] clear session fallback", error);
  }
}
