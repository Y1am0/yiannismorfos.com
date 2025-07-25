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
import { NAVIGATION_CATEGORIES, Z_INDEX } from "./constants";
import { GlassPill } from "./GlassPill";
import { Logo } from "./Logo";
import { getBlogItem, getLogoItem, getNavigationItems } from "./menu-items";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";
import { ExternalLinkId, NavigationItemId } from "./types";

import { NavigationItem } from "./NavigationItem";
import { useElementRegistryState } from "./stores/elementRegistryState";
import { useNavigationActions, useNavigationSelectors } from "./stores/index";
import { useMobileMenuState } from "./stores/mobileMenuState";

const NavigationComponent = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Page load animation state
  const { isNavigationVisible } = usePageLoadAnimation();

  const {
    displayedItem,
    isMobile,
    activeItem,
    isMobileMenuOpen,
    hoveredItem,
    animationsComplete,
  } = useNavigationSelectors();

  const setIsMobile = useMobileMenuState((state) => state.setIsMobile);
  const parentElement = useElementRegistryState((state) => state.parentElement);
  const clearMobileRegistry = useElementRegistryState(
    (state) => state.clearMobileRegistry
  );

  const {
    setParentElement,
    setActiveItem,
    updateGlassPillPosition,
    setGlassPillVisible,
  } = useNavigationActions();

  // Get element registry methods directly from the store
  const getDesktopElement = useElementRegistryState(
    (state) => state.getDesktopElement
  );
  const getMobileElement = useElementRegistryState(
    (state) => state.getMobileElement
  );

  // Memoized menu items to prevent recreation
  const menuItems = useMemo(
    () => ({
      logo: getLogoItem(),
      navigation: getNavigationItems(),
      blog: getBlogItem(),
    }),
    []
  );

  // Set up active item based on pathname
  useEffect(() => {
    // Check both navigation items and blog item for pathname match
    const currentItem =
      menuItems.navigation.find((item) => pathname === item.href) ||
      (menuItems.blog && pathname === menuItems.blog.href
        ? menuItems.blog
        : null);
    setActiveItem((currentItem?.id as NavigationItemId) || null);
  }, [pathname, setActiveItem, menuItems.navigation, menuItems.blog]);

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
    let resizeTimer: NodeJS.Timeout | null = null;
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
      clearMobileRegistry();
      // Hide glass pill when mobile menu closes
      if (isMobile) {
        setGlassPillVisible(false);
      }
    }
  }, [isMobileMenuOpen, clearMobileRegistry, isMobile, setGlassPillVisible]);

  // Handle glass pill visibility and positioning based on mobile state and menu state
  useEffect(() => {
    const updateGlassPillState = () => {
      // Use hoveredItem from selector
      const currentDisplayedItem = hoveredItem || activeItem;

      if (!currentDisplayedItem || !parentElement) {
        setGlassPillVisible(false);
        return;
      }

      // Desktop: Show pill on any displayed desktop element
      if (!isMobile) {
        const displayedDesktopElement = getDesktopElement(currentDisplayedItem);
        if (displayedDesktopElement) {
          updateGlassPillPosition(displayedDesktopElement, parentElement);
        } else {
          setGlassPillVisible(false);
        }
        return;
      }

      // Mobile: Different rules for different elements
      if (isMobile) {
        const isLogoOrHamburger =
          currentDisplayedItem === "logo" || currentDisplayedItem === "menu";
        const isNavigationItem = NAVIGATION_CATEGORIES.navigationItems.includes(
          currentDisplayedItem as NavigationItemId
        );
        const isBlogItem = currentDisplayedItem === "blog";
        const isExternalLink = NAVIGATION_CATEGORIES.externalLinks.includes(
          currentDisplayedItem as ExternalLinkId
        );
        const isMusicPlayerButton =
          NAVIGATION_CATEGORIES.musicPlayerButtons.includes(
            currentDisplayedItem
          );
        if (isLogoOrHamburger || isExternalLink || isMusicPlayerButton) {
          // Logo, hamburger, external links, and music player buttons are always visible on mobile - use desktop elements
          const displayedDesktopElement =
            getDesktopElement(currentDisplayedItem);
          if (displayedDesktopElement) {
            updateGlassPillPosition(displayedDesktopElement, parentElement);
          } else {
            setGlassPillVisible(false);
          }
        } else if ((isNavigationItem || isBlogItem) && isMobileMenuOpen) {
          // Navigation items and blog are ONLY visible when mobile menu is open - use mobile elements
          // If user is actively hovering, position immediately. If it's just active item, wait for animations to complete
          const shouldPosition =
            hoveredItem === currentDisplayedItem || animationsComplete;

          if (shouldPosition) {
            const displayedMobileElement =
              getMobileElement(currentDisplayedItem);
            if (displayedMobileElement) {
              updateGlassPillPosition(displayedMobileElement, parentElement);
            } else {
              setGlassPillVisible(false);
            }
          } else {
            setGlassPillVisible(false);
          }
        } else {
          // Mobile menu is closed and item is a navigation item, or unknown item - hide pill
          setGlassPillVisible(false);
        }
      }
    };

    updateGlassPillState();
  }, [
    hoveredItem,
    activeItem,
    parentElement,
    isMobile,
    isMobileMenuOpen,
    animationsComplete,
    getDesktopElement,
    getMobileElement,
    updateGlassPillPosition,
    setGlassPillVisible,
  ]);

  // ---- Re-position glass pill on viewport resize ---------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return; // SSR guard

    const reposition = () => {
      // Only reposition if pill should be visible
      if (activeItem && parentElement) {
        const isLogoOrHamburger =
          activeItem === "logo" || activeItem === "menu";
        const isNavigationItem = ["hello", "who", "what", "connect"].includes(
          activeItem
        );
        const isBlogItem = activeItem === "blog";
        const isExternalLink = NAVIGATION_CATEGORIES.externalLinks.includes(
          activeItem as ExternalLinkId
        );

        if (!isMobile) {
          // Desktop: reposition on desktop element
          const activeElement = getDesktopElement(activeItem);
          if (activeElement) {
            updateGlassPillPosition(activeElement, parentElement);
          }
        } else {
          // Mobile: different logic based on item type
          if (isLogoOrHamburger || isExternalLink) {
            // Logo/hamburger/external links always use desktop elements (always visible)
            const activeElement = getDesktopElement(activeItem);
            if (activeElement) {
              updateGlassPillPosition(activeElement, parentElement);
            }
          } else if (
            (isNavigationItem || isBlogItem) &&
            isMobileMenuOpen &&
            animationsComplete
          ) {
            // Navigation items only work when mobile menu is open and animations are complete (use mobile elements)
            const activeElement = getMobileElement(activeItem);
            if (activeElement) {
              updateGlassPillPosition(activeElement, parentElement);
            }
          }
          // If mobile menu is closed and it's a navigation item, do nothing (pill should be hidden)
        }
      }
    };

    // rAF throttle – keeps updates in sync with paint
    let frameId: number | null = null;
    const onResize = () => {
      if (frameId !== null) return; // already queued
      frameId = window.requestAnimationFrame(() => {
        reposition();
        frameId = null;
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, [
    activeItem,
    parentElement,
    isMobile,
    isMobileMenuOpen,
    animationsComplete,
    getMobileElement,
    getDesktopElement,
    updateGlassPillPosition,
  ]);

  // Set up parent element reference
  useEffect(() => {
    if (parentRef.current) {
      setParentElement(parentRef.current);
    }
  }, [setParentElement]);

  // Global mouse up listener to reset pressed state
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Reset pressed state is handled automatically by Zustand stores
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <>
      <motion.div
        ref={parentRef}
        className="w-full text-white max-w-screen-2xl mx-auto flex justify-center px-4 lg:px-12 py-8 relative"
        style={{ zIndex: Z_INDEX.navigationOverlay }}
        initial={PAGE_LOAD_ANIMATIONS.navigation.initial}
        animate={
          isNavigationVisible
            ? PAGE_LOAD_ANIMATIONS.navigation.animate
            : PAGE_LOAD_ANIMATIONS.navigation.initial
        }
        transition={PAGE_LOAD_ANIMATIONS.navigation.transition}
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
        <GlassPill displayedItem={displayedItem} />
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
