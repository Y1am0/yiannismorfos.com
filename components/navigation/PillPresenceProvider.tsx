"use client";

import { createContext, useContext, useMemo, useRef } from "react";

type PillPresenceController = {
  getWasPresentLastCommit: () => boolean;
  register: () => void;
  unregister: () => void;
};

const PillPresenceContext = createContext<PillPresenceController | null>(null);

export const PillPresenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mountedCountRef = useRef(0);
  const wasPresentLastCommitRef = useRef(false);

  const controller = useMemo<PillPresenceController>(() => {
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
    <PillPresenceContext.Provider value={controller}>
      {children}
    </PillPresenceContext.Provider>
  );
};

export const usePillPresence = () => {
  const controller = useContext(PillPresenceContext);

  // Fallback behavior if used outside provider:
  // treat as "no previous pill", so the enter animation can run.
  if (!controller) {
    return {
      getWasPresentLastCommit: () => false,
      register: () => {},
      unregister: () => {},
    } satisfies PillPresenceController;
  }

  return controller;
};

