"use client";

import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimation,
} from "@/lib/usePageLoadAnimation";
import { createContext, useContext } from "react";

type PageLoadAnimationContextValue = ReturnType<typeof usePageLoadAnimation>;

const PageLoadAnimationContext =
  createContext<PageLoadAnimationContextValue | null>(null);

export const PageLoadAnimationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const value = usePageLoadAnimation();
  return (
    <PageLoadAnimationContext.Provider value={value}>
      {children}
    </PageLoadAnimationContext.Provider>
  );
};

export const usePageLoadAnimationContext = () => {
  const ctx = useContext(PageLoadAnimationContext);
  if (!ctx) {
    throw new Error(
      "usePageLoadAnimationContext must be used within <PageLoadAnimationProvider>"
    );
  }
  return ctx;
};

// Convenience re-export for existing callers that used PAGE_LOAD_ANIMATIONS directly.
export { PAGE_LOAD_ANIMATIONS };

