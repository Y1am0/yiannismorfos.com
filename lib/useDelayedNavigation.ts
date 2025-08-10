"use client";

import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export type DelayedNavOptions = {
  delay?: number;
  beforeNavigate?: () => void;
  condition?: boolean; // if false, navigate immediately
};

export function useDelayedNavigation(defaultDelay = 300) {
  const router = useRouter();
  const prefersReduced = usePrefersReducedMotion();
  const timeoutRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const delayedNavigate = useCallback(
    (href: string, options: DelayedNavOptions = {}) =>
      (e?: React.MouseEvent<HTMLElement>) => {
        const {
          delay = defaultDelay,
          beforeNavigate,
          // By default, skip delay for reduced-motion users
          condition = !prefersReduced,
        } = options;

        // Respect modified/middle clicks for new tab/window behavior
        if (
          e &&
          (e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            (e as React.MouseEvent).button !== 0)
        ) {
          return;
        }

        // Prevent default Link navigation so we can delay
        e?.preventDefault();

        // Immediate navigation if condition is false
        if (!condition) {
          beforeNavigate?.();
          router.push(href);
          return;
        }

        cancel();
        beforeNavigate?.();
        timeoutRef.current = window.setTimeout(() => {
          router.push(href);
        }, delay);
      },
    [router, cancel, prefersReduced, defaultDelay]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return { delayedNavigate, cancel };
}
