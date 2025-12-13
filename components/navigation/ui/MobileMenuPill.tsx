"use client";

import {
  ANIMATION_CONFIG,
  GLASS_EFFECT_STYLES_OVERLAY,
  SPRING_PRESETS,
} from "@/components/navigation/config/constants";
import { isNavOrBlogId } from "@/components/navigation/model/navigationPolicy";
import { useNavigationState } from "@/components/navigation/stores/navigationState";
import { animate, motion, useMotionValue } from "motion/react";
import type { RefObject } from "react";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

type Props = {
  containerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  animationsComplete: boolean;
  onExitComplete: () => void;
};

export const MobileMenuPill = ({
  containerRef,
  isOpen,
  animationsComplete,
  onExitComplete,
}: Props) => {
  const { hoveredItem, activeItem, pressedItem, exitingItem } =
    useNavigationState(
      useShallow((s) => ({
        hoveredItem: s.hoveredItem,
        activeItem: s.activeItem,
        pressedItem: s.pressedItem,
        exitingItem: s.exitingItem,
      }))
    );

  const displayedItem = hoveredItem || activeItem;
  const targetId = displayedItem ?? exitingItem;
  const isExiting = !displayedItem && !!exitingItem;
  const isPressed = pressedItem != null && pressedItem === targetId;

  const shouldRender =
    isOpen && animationsComplete && !!targetId && isNavOrBlogId(targetId);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  const spring = useMemo(
    () => ({
      stiffness: SPRING_PRESETS.glass.stiffness,
      damping: SPRING_PRESETS.glass.damping,
      bounce: SPRING_PRESETS.glass.bounce,
    }),
    []
  );

  const animationsRef = useRef<ReturnType<typeof animate>[]>([]);
  const hasMeasuredRef = useRef(false);

  useLayoutEffect(() => {
    if (!shouldRender || !targetId) {
      hasMeasuredRef.current = false;
      animationsRef.current.forEach((a) => a.stop());
      animationsRef.current = [];
      return;
    }

    const el = containerRef.current?.querySelector<HTMLElement>(
      `[data-nav-item-id="${targetId}"]`
    );
    if (!el) return;

    const rect = el.getBoundingClientRect();

    animationsRef.current.forEach((a) => a.stop());
    animationsRef.current = [];

    if (!hasMeasuredRef.current) {
      x.set(rect.left);
      y.set(rect.top);
      width.set(rect.width);
      height.set(rect.height);
      hasMeasuredRef.current = true;
      return;
    }

    animationsRef.current.push(animate(x, rect.left, spring));
    animationsRef.current.push(animate(y, rect.top, spring));
    animationsRef.current.push(animate(width, rect.width, spring));
    animationsRef.current.push(animate(height, rect.height, spring));
  }, [containerRef, height, shouldRender, spring, targetId, width, x, y]);

  if (!shouldRender) return null;

  return (
    <motion.div
      className="pointer-events-none rounded-full"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x,
        y,
        width,
        height,
        zIndex: 1,
        ...GLASS_EFFECT_STYLES_OVERLAY,
        willChange: "transform, width, height, opacity",
      }}
      initial={ANIMATION_CONFIG.glassPill.initial}
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
        scale: {
          type: "spring",
          stiffness: isPressed ? 400 : 300,
          damping: isPressed ? 25 : 20,
          bounce: isPressed ? 0.3 : 0.8,
        },
      }}
      onAnimationComplete={() => {
        if (!isExiting) return;
        onExitComplete();
      }}
    />
  );
};
