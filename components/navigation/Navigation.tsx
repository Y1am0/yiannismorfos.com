"use client";

import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimation,
} from "@/lib/usePageLoadAnimation";
import { Quote } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { memo, useEffect, useMemo, useRef } from "react";
import { AbsoluteItem } from "./AbsoluteItem";
import { Z_INDEX } from "./constants";
import { GlassPill } from "./GlassPill";
import { Logo } from "./Logo";
import { getBlogItem, getLogoItem, getNavigationItems } from "./menu-items";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";
import { getEffectiveDisplayedItem } from "./navigationPolicy";
import { NavigationItemId } from "./types";

import { NavigationItem } from "./NavigationItem";
import { useElementRegistryState } from "./stores/elementRegistryState";
import { useNavigationActions, useNavigationSelectors } from "./stores/index";
import { useMobileMenuState } from "./stores/mobileMenuState";
import { useGlassPillController } from "./useGlassPillController";

const NavigationComponent = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Page load animation state
  const {
    isNavigationVisible,
    shouldAnimate,
    animationsComplete: pageLoadComplete,
  } = usePageLoadAnimation();

  const {
    isMobile,
    activeItem,
    isMobileMenuOpen,
    hoveredItem,
    animationsComplete,
  } = useNavigationSelectors();

  const setIsMobile = useMobileMenuState((state) => state.setIsMobile);
  const clearOverlayRegistry = useElementRegistryState(
    (state) => state.clearOverlayRegistry
  );

  const { setParentElement, validateRouteChange, setGlassPillVisible, handleMouseUp } =
    useNavigationActions();

  // Memoized menu items to prevent recreation
  const menuItems = useMemo(
    () => ({
      logo: getLogoItem(),
      navigation: getNavigationItems(),
      blog: getBlogItem(),
    }),
    []
  );

  // Validate route change and set active item accordingly
  useEffect(() => {
    const normalizePath = (path?: string) => (path ? path.split("?")[0] : null);

    // Check both navigation items and blog item for pathname match (ignore query strings)
    const currentItem =
      menuItems.navigation.find(
        (item) => normalizePath(item.href) === pathname
      ) ||
      (menuItems.blog && normalizePath(menuItems.blog.href) === pathname
        ? menuItems.blog
        : null);

    const actualRouteItemId: NavigationItemId | null = currentItem?.id ?? null;

    // Validate the route change - this will handle setting the correct active item
    validateRouteChange(actualRouteItemId);
  }, [pathname, validateRouteChange, menuItems.navigation, menuItems.blog]);

  // Centralized pill controller (positions/hides the pill based on state + registry).
  useGlassPillController(pageLoadComplete);

  // ---- Responsive breakpoint detection -------------------------------------------------
  // Guards against SSR and debounces the expensive resize handler.
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    // Detect <768px viewport as mobile
    const checkMobile = () => {
      const wasMobile = useMobileMenuState.getState().isMobile;
      const isNowMobile = window.innerWidth < 768;

      setIsMobile(isNowMobile);

      // Auto-close mobile menu when moving from mobile → desktop
      if (wasMobile && !isNowMobile && isMobileMenuOpen) {
        const { closeMenu } = useMobileMenuState.getState();
        closeMenu();
      }
    };

    // Debounce via setTimeout (50 ms) to avoid firing on every pixel change
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const debounced = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 50);
    };

    // Initial run
    checkMobile();
    window.addEventListener("resize", debounced);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("resize", debounced);
    };
  }, [setIsMobile, isMobileMenuOpen]);

  // Clear mobile registry when mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      clearOverlayRegistry();
      // Hide glass pill when mobile menu closes for a clean state.
      if (isMobile) setGlassPillVisible(false);
    }
  }, [isMobileMenuOpen, clearOverlayRegistry, isMobile, setGlassPillVisible]);

  // Set up parent element reference
  useEffect(() => {
    if (parentRef.current) {
      setParentElement(parentRef.current);
    }
  }, [setParentElement]);

  // Global mouse up listener to reset pressed state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <>
      <motion.div
        ref={parentRef}
        className="w-full text-white max-w-screen-2xl mx-auto flex justify-center px-6 lg:px-12 py-8 relative nav-area"
        style={{ zIndex: Z_INDEX.navigationOverlay }}
        initial={
          shouldAnimate
            ? PAGE_LOAD_ANIMATIONS.navigation.initial
            : PAGE_LOAD_ANIMATIONS.navigation.animate
        }
        animate={
          isNavigationVisible
            ? PAGE_LOAD_ANIMATIONS.navigation.animate
            : PAGE_LOAD_ANIMATIONS.navigation.initial
        }
        transition={
          shouldAnimate
            ? PAGE_LOAD_ANIMATIONS.navigation.transition
            : { duration: 0 }
        }
      >
        {/* Logo - Always visible on left with high z-index */}
        <AbsoluteItem position="left">
          <Logo href={menuItems.logo?.href} />
        </AbsoluteItem>

        {/* Centered navigation - Responsive visibility */}
        <div
          ref={containerRef}
          className="flex items-center relative min-h-[3rem] md:min-h-0"
        >
          <div className="md:flex hidden">
            {menuItems.navigation.map((item) => (
              <NavigationItem key={item.id} itemId={item.id} href={item.href}>
                {item.label}
              </NavigationItem>
            ))}
          </div>
        </div>

        {/* Desktop: Blog/Quote icon */}
        <AbsoluteItem position="right" className="hidden md:block">
          <NavigationItem itemId="blog" href={menuItems.blog?.href}>
            <Quote size={24} strokeWidth={0} fill="currentColor" />
          </NavigationItem>
        </AbsoluteItem>

        {/* Mobile: Menu toggle icon */}
        <AbsoluteItem position="right" className="md:hidden">
          <MenuToggle />
        </AbsoluteItem>

        {/* Glass pill effect */}
        <GlassPill
          displayedItem={getEffectiveDisplayedItem(hoveredItem, activeItem, {
            isMobileViewport: isMobile,
            isMobileMenuOpen,
            mobileMenuAnimationsComplete: animationsComplete,
          })}
        />
      </motion.div>

      {/* Mobile Menu Modal */}
      <MobileMenu />
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const Navigation = memo(NavigationComponent);

// Add display name for debugging
Navigation.displayName = "Navigation";
