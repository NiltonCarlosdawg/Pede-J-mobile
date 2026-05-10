import { safeGetItem, safeRemoveItem, safeSetItem } from "../utils/storage";
import type { User } from "../types";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
const AUTH_ROLE_KEY = "sessionRole";

export type DemoRole = "client" | "delivery";

let memorySession: DemoSession | null = null;

export const DEMO_LOGIN = {
  client: {
    email: "demo@pedeja.com",
    password: "123456",
  },
  delivery: {
    email: "entregador@pedeja.com",
    password: "123456",
  },
};

export const DEMO_CLIENT_USER: User = {
  id: "demo-client",
  name: "Alexandre João",
  email: DEMO_LOGIN.client.email,
  phone: "+244 923 123 456",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2e?w=200",
  createdAt: "2026-05-08T00:00:00.000Z",
};

export const DEMO_DELIVERY_USER: User = {
  id: "demo-delivery",
  name: "Carlos N'zau",
  email: DEMO_LOGIN.delivery.email,
  phone: "+244 923 555 900",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  createdAt: "2026-05-08T00:00:00.000Z",
};

export type DemoSession = {
  token: string;
  user: User;
  role: DemoRole;
};

export function isDemoCredentials(
  email: string,
  password: string,
  role: DemoRole
) {
  const credentials =
    role === "delivery" ? DEMO_LOGIN.delivery : DEMO_LOGIN.client;

  return (
    email.trim().toLowerCase() === credentials.email &&
    password === credentials.password
  );
}

export function createDemoSession(role: DemoRole): DemoSession {
  return {
    token: role === "delivery" ? "demo-delivery-token" : "demo-client-token",
    user: role === "delivery" ? DEMO_DELIVERY_USER : DEMO_CLIENT_USER,
    role,
  };
}

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

    if (role !== "client" && role !== "delivery") {
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
