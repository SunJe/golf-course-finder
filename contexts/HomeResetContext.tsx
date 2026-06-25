"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearHomeResetPending,
  clearHomeUrlState,
  markHomeResetPending,
} from "@/lib/homeResetState";

type ResetHomeFn = () => void;

interface HomeResetContextValue {
  registerHomeReset: (fn: ResetHomeFn) => () => void;
  goHome: (event?: MouseEvent<HTMLElement>) => void;
  resetCurrentView: () => void;
}

const HomeResetContext = createContext<HomeResetContextValue | null>(null);

export function HomeResetProvider({ children }: { children: ReactNode }) {
  const resetRef = useRef<ResetHomeFn | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const registerHomeReset = useCallback((fn: ResetHomeFn) => {
    resetRef.current = fn;
    return () => {
      if (resetRef.current === fn) {
        resetRef.current = null;
      }
    };
  }, []);

  const goHome = useCallback(
    (event?: MouseEvent<HTMLElement>) => {
      event?.preventDefault();

      markHomeResetPending();
      clearHomeUrlState();

      if (pathname === "/map") {
        router.push("/");
        return;
      }

      if (pathname === "/") {
        resetRef.current?.();
        clearHomeResetPending();
        return;
      }

      router.push("/");
    },
    [pathname, router],
  );

  const resetCurrentView = useCallback(() => {
    clearHomeUrlState();
    resetRef.current?.();
    clearHomeResetPending();
  }, []);

  return (
    <HomeResetContext.Provider
      value={{ registerHomeReset, goHome, resetCurrentView }}
    >
      {children}
    </HomeResetContext.Provider>
  );
}

export function useHomeReset(): HomeResetContextValue {
  const context = useContext(HomeResetContext);
  if (!context) {
    throw new Error("useHomeReset must be used within HomeResetProvider");
  }
  return context;
}
