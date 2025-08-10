"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

export function RouteTransitionSync() {
  const pathname = usePathname();
  const clearExit = useRouteTransitionStore((s) => s.clearExit);

  // Clear exit as soon as the route changes to enable entrance animations
  useLayoutEffect(() => {
    clearExit();
  }, [pathname, clearExit]);

  // Fallback in case of concurrent updates
  useEffect(() => {
    clearExit();
  }, [pathname, clearExit]);

  return null;
}
