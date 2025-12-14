"use client";

import { NAVIGATION_DESKTOP_MEDIA_QUERY } from "@/components/navigation/config/breakpoints";
import { useMediaQuery } from "@/components/navigation/hooks/useMediaQuery";
import { LayoutGroup } from "motion/react";
import { createContext, useContext, useMemo, useRef } from "react";

// -------------------------------------------------------------------------------------
// Viewport context (computed once for the navigation system)
// -------------------------------------------------------------------------------------

type NavigationViewport = {
  isDesktopViewport: boolean;
};

const NavigationViewportContext = createContext<NavigationViewport | null>(null);

export const useNavigationViewport = () => {
  const ctx = useContext(NavigationViewportContext);
  // Safe fallback if used outside provider.
  return ctx ?? ({ isDesktopViewport: true } satisfies NavigationViewport);
};

// -------------------------------------------------------------------------------------
// Pill presence controller (tracks whether a pill existed in the previous commit)
// -------------------------------------------------------------------------------------

type PillPresenceController = {
  getWasPresentLastCommit: () => boolean;
  register: () => void;
  unregister: () => void;
};

const PillPresenceContext = createContext<PillPresenceController | null>(null);

export const usePillPresence = () => {
  const controller = useContext(PillPresenceContext);

  // Safe fallback if used outside provider:
  // treat as "no previous pill", so enter animation can run.
  if (!controller) {
    return {
      getWasPresentLastCommit: () => false,
      register: () => {},
      unregister: () => {},
    } satisfies PillPresenceController;
  }

  return controller;
};

// -------------------------------------------------------------------------------------
// Single public provider: wraps all navigation pill concerns
// -------------------------------------------------------------------------------------

export const NavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isDesktopViewport = useMediaQuery(NAVIGATION_DESKTOP_MEDIA_QUERY);

  const mountedCountRef = useRef(0);
  const wasPresentLastCommitRef = useRef(false);

  const presenceController = useMemo<PillPresenceController>(() => {
    return {
      getWasPresentLastCommit: () => wasPresentLastCommitRef.current,
      register: () => {
        mountedCountRef.current += 1;
        wasPresentLastCommitRef.current = true;
      },
      unregister: () => {
        mountedCountRef.current = Math.max(0, mountedCountRef.current - 1);
        wasPresentLastCommitRef.current = mountedCountRef.current > 0;
      },
    };
  }, []);

  return (
    <NavigationViewportContext.Provider value={{ isDesktopViewport }}>
      <PillPresenceContext.Provider value={presenceController}>
        <LayoutGroup id="navigation-glass-pill">{children}</LayoutGroup>
      </PillPresenceContext.Provider>
    </NavigationViewportContext.Provider>
  );
};

