import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";
import { useEffect, useMemo, useState } from "react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
  sessionOptions: {
    refetchOnWindowFocus: false,
    refetchInterval: 0,
    refetchWhenOffline: false,
  },
});

export const { signIn, signUp, signOut, getAccessToken } = authClient;

type SessionData = typeof authClient.$Infer.Session | null;

type SessionState = {
  data: SessionData;
  isPending: boolean;
  isRefetching: boolean;
  error: Error | null;
};

let cachedSession: SessionData = null;
let isLoading = false;
let lastError: Error | null = null;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const normalizeSessionResponse = (response: unknown): SessionData => {
  if (!response) return null;
  if (typeof response === "object" && response !== null && "data" in response) {
    const data = (response as { data?: SessionData }).data;
    return data ?? null;
  }
  return response as SessionData;
};

const normalizeSessionError = (response: unknown): Error | null => {
  if (!response || typeof response !== "object") return null;
  if ("error" in response) {
    const err = (response as { error?: unknown }).error;
    if (!err) return null;
    if (err instanceof Error) return err;
    if (typeof err === "object" && err && "message" in err) {
      return new Error(String((err as { message?: unknown }).message));
    }
    return new Error("Failed to fetch session.");
  }
  return null;
};

const fetchSessionOnce = async () => {
  if (isLoading) return;
  isLoading = true;
  notifyListeners();
  try {
    const response = await authClient.getSession();
    cachedSession = normalizeSessionResponse(response);
    lastError = normalizeSessionError(response);
  } catch (err) {
    cachedSession = null;
    lastError = err instanceof Error ? err : new Error("Failed to fetch session.");
  } finally {
    isLoading = false;
    notifyListeners();
  }
};

export function useSession() {
  const [state, setState] = useState<SessionState>(() => ({
    data: cachedSession,
    isPending: cachedSession === null && !lastError,
    isRefetching: false,
    error: lastError,
  }));

  useEffect(() => {
    const handleUpdate = () => {
      setState({
        data: cachedSession,
        isPending: isLoading && cachedSession === null,
        isRefetching: isLoading && cachedSession !== null,
        error: lastError,
      });
    };

    listeners.add(handleUpdate);
    handleUpdate();
    if (cachedSession === null && !isLoading && !lastError) {
      void fetchSessionOnce();
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const refetch = useMemo(
    () => async () => {
      await fetchSessionOnce();
    },
    [],
  );

  return {
    data: state.data,
    isPending: state.isPending,
    isRefetching: state.isRefetching,
    error: state.error,
    refetch,
  };
}
  authClient;