"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { memo, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { ANIMATION_CONFIG, GLASS_EFFECT_STYLES_OVERLAY, SPRING_PRESETS, Z_INDEX } from "./constants";
import { getBlogItem, getNavigationItems } from "./menu-items";
import { NavigationItem } from "./NavigationItem";
import { useNavigationActions, useNavigationSelectors } from "./stores";
import { useMobileMenuState } from "./stores/mobileMenuState";
import { useNavigationState } from "./stores/navigationState";
import type { NavigationItemId } from "./types";

const MobileMenuComponent = () => {
  const { isMobileMenuOpen } = useNavigationSelectors();
  const { closeMenu, clearExitingItem } = useNavigationActions();
  const mobileMenuAnimationsComplete = useMobileMenuState(
    (s) => s.animationsComplete
  );
  const hoveredItem = useNavigationState((s) => s.hoveredItem);
  const activeItem = useNavigationState((s) => s.activeItem);
  const pressedItem = useNavigationState((s) => s.pressedItem);
  const exitingItem = useNavigationState((s) => s.exitingItem);

  // Memoized menu items to prevent recreation on each render
  const menuItems = useMemo(() => {
    const navigationItems = getNavigationItems();
    const blogItem = getBlogItem();
    return [...navigationItems, ...(blogItem ? [blogItem] : [])];
  }, []);
  const menuItemIdSet = useMemo(() => {
    return new Set<NavigationItemId>(menuItems.map((i) => i.id as NavigationItemId));
  }, [menuItems]);

  const contentRef = useRef<HTMLDivElement>(null);

  const displayedItem = hoveredItem || activeItem;
  const targetId = displayedItem ?? exitingItem;
  const isExiting = !displayedItem && !!exitingItem;
  const isPressed = pressedItem != null && pressedItem === targetId;

  const shouldRenderPill =
    !!targetId &&
    isMobileMenuOpen &&
    mobileMenuAnimationsComplete &&
    menuItemIdSet.has(targetId);

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
    if (!shouldRenderPill || !targetId) {
      hasMeasuredRef.current = false;
      animationsRef.current.forEach((a) => a.stop());
      animationsRef.current = [];
      return;
    }

    const container = contentRef.current;
    const el = container?.querySelector<HTMLElement>(
      `[data-nav-item-id="${targetId}"]`
    );
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // Stop any in-flight animations before starting new ones.
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
  }, [height, shouldRenderPill, spring, targetId, width, x, y]);

  // Memoized backdrop click handler
  const handleBackdropClick = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  // Memoized content click handler to prevent event bubbling
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: Z_INDEX.mobileMenu }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          {shouldRenderPill && (
            <motion.div
              // Overlay pill: single element, explicit x/y/width/height animation.
              // This avoids shared-layout size scaling/reparenting inside the overlay,
              // which can cause visual flicker in gradients/shadows.
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
                clearExitingItem();
              }}
            />
          )}
          <motion.div
            ref={contentRef}
            className="text-white flex flex-col items-center space-y-4 relative z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            onClick={handleContentClick}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                }}
              >
                <NavigationItem
                  itemId={item.id}
                  href={item.href}
                  onClick={closeMenu}
                  isMobile={true}
                >
                  <span className="text-4xl font-thin text-center">
                    {item.label}
                  </span>
                </NavigationItem>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MobileMenu = memo(MobileMenuComponent);

// Add display name for debugging
MobileMenu.displayName = "MobileMenu";
