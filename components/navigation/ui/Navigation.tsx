"use client";

import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimationContext,
} from "@/components/PageLoadAnimationProvider";
import { Quote } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { memo, useEffect, useMemo } from "react";
import { Z_INDEX } from "../config/constants";
import { NavigationItemId } from "../model/types";
import {
  getBlogItem,
  getLogoItem,
  getNavigationItems,
} from "../utils/menu-items";
import { AbsoluteItem } from "./AbsoluteItem";
import { Logo } from "./Logo";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";

import { useNavigationActions, useNavigationSelectors } from "../stores/index";
import { useMobileMenuState } from "../stores/mobileMenuState";
import { NavigationItem } from "./NavigationItem";

const NavigationComponent = () => {
  const pathname = usePathname();

  // Page load animation state
  const { isNavigationVisible, shouldAnimate } = usePageLoadAnimationContext();

  const { isMobile, isMobileMenuOpen } = useNavigationSelectors();

  const setIsMobile = useMobileMenuState((state) => state.setIsMobile);
  const { validateRouteChange, handleMouseUp, setHoveredItem } =
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
      // Clear hover state when the mobile menu closes to avoid "stuck" highlights.
      if (isMobile) setHoveredItem(null);
    }
  }, [isMobileMenuOpen, isMobile, setHoveredItem]);

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
        <div className="flex items-center relative min-h-[3rem] md:min-h-0">
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
