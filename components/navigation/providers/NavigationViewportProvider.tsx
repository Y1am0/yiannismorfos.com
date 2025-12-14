"use client";

import { NAVIGATION_DESKTOP_MEDIA_QUERY } from "@/components/navigation/config/breakpoints";
import { useMediaQuery } from "@/components/navigation/hooks/useMediaQuery";
import { createContext, useContext } from "react";

type NavigationViewport = {
  isDesktopViewport: boolean;
};

const NavigationViewportContext = createContext<NavigationViewport | null>(null);

export const NavigationViewportProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isDesktopViewport = useMediaQuery(NAVIGATION_DESKTOP_MEDIA_QUERY);

  return (
    <NavigationViewportContext.Provider value={{ isDesktopViewport }}>
      {children}
    </NavigationViewportContext.Provider>
  );
};

export const useNavigationViewport = () => {
  const ctx = useContext(NavigationViewportContext);
  if (!ctx) {
    // Safe fallback: behave like desktop so pills aren't unexpectedly disabled
    // if someone forgets to mount the provider.
    return { isDesktopViewport: true } satisfies NavigationViewport;
  }
  return ctx;
};

