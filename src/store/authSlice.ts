import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { DemoRole } from "../services/demoAuth";
import type { User } from "../types";

export interface AuthState {
  initialized: boolean;
  token: string | null;
  user: User | null;
  role: DemoRole | null;
}

const initialState: AuthState = {
  initialized: false,
  token: null,
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateSession(
      state,
      action: PayloadAction<{
        token: string | null;
        user: User | null;
        role: DemoRole | null;
      }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.initialized = true;
    },
    setSession(
      state,
      action: PayloadAction<{ token: string; user: User; role: DemoRole }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.initialized = true;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.role = null;
      state.initialized = true;
    },
  },
});

export const { clearSession, hydrateSession, setSession } = authSlice.actions;
export const authReducer = authSlice.reducer;
