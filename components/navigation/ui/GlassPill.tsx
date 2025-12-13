"use client";
import {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES,
  TIMING,
} from "@/components/navigation/config/constants";
import { usePillPresence } from "@/components/navigation/providers/PillPresenceProvider";
import { motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";

export type GlassPillVariant = "pill" | "circle";

type Props = {
  variant: GlassPillVariant;
  isPressed?: boolean;
  isExiting?: boolean;
  circleSizePx?: number;
  layoutId?: string;
  onExitComplete?: () => void;
};

export const GlassPill = ({
  variant,
  isPressed = false,
  isExiting = false,
  circleSizePx,
  layoutId = "glass-pill",
  onExitComplete,
}: Props) => {
  const isCircle = variant === "circle";
  const presence = usePillPresence();
  const shouldRunEnterAnimation =
    typeof window === "undefined" ? false : !presence.getWasPresentLastCommit();
  const didNotifyExitRef = useRef(false);

  const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

  useIsomorphicLayoutEffect(() => {
    presence.register();

    return () => {
      presence.unregister();
    };
  }, [presence]);

  useEffect(() => {
    if (!isExiting) didNotifyExitRef.current = false;
  }, [isExiting]);

  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => {
      if (didNotifyExitRef.current) return;
      didNotifyExitRef.current = true;
      onExitComplete?.();
    }, TIMING.glassPillExitDuration);
    return () => clearTimeout(t);
  }, [isExiting, onExitComplete]);

  return (
    <motion.span
      layoutId={layoutId}
      layout
      // Avoid re-running mount "initial" animations on every hover target change.
      // Shared-layout should handle the movement; we only animate scale for press feedback.
      initial={
        shouldRunEnterAnimation ? ANIMATION_CONFIG.glassPill.initial : false
      }
      className={
        isCircle
          ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          : "absolute inset-0 rounded-full pointer-events-none"
      }
      style={{
        ...(isCircle && circleSizePx
          ? { width: circleSizePx, height: circleSizePx }
          : null),
        ...GLASS_EFFECT_STYLES,
      }}
      animate={{
        opacity: isExiting ? ANIMATION_CONFIG.glassPill.exit.opacity : 1,
        scale: isExiting
          ? ANIMATION_CONFIG.glassPill.exit.scale
          : isPressed
          ? 1.1
          : 1,
      }}
      transition={{
        opacity: { duration: 0.12 },
        scale: isExiting
          ? {
              type: "spring",
              stiffness: 260,
              damping: 26,
              bounce: 0,
            }
          : {
              type: "spring",
              stiffness: isPressed ? 400 : 300,
              damping: isPressed ? 25 : 20,
              bounce: isPressed ? 0.3 : 0.8,
            },
        layout: ANIMATION_CONFIG.glassPill.transition.layout,
      }}
      onAnimationComplete={() => {
        if (!isExiting || didNotifyExitRef.current) return;
        didNotifyExitRef.current = true;
        onExitComplete?.();
      }}
    />
  );
};
