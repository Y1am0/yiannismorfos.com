"use client";

import {
  PAGE_LOAD_ANIMATIONS,
  usePageLoadAnimationContext,
} from "@/components/PageLoadAnimationProvider";
import { Quote } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Z_INDEX } from "../config/constants";
import type { NavigationItemId } from "../config/navigationConfig";
import { useNavigationViewport } from "../providers/NavigationViewportProvider";
import {
  getBlogItem,
  getLogoItem,
  getNavigationItems,
} from "../utils/menu-items";
import { AbsoluteItem } from "./AbsoluteItem";
import { Logo } from "./Logo";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";

import { useNavigationActions } from "../stores/index";
import { NavigationItem } from "./NavigationItem";

const NavigationComponent = () => {
  const pathname = usePathname();

  // Page load animation state
  const { isNavigationVisible, shouldAnimate } = usePageLoadAnimationContext();

  const { isDesktopViewport } = useNavigationViewport();
  const isMobileViewport = !isDesktopViewport;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

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

  // Auto-close mobile menu when moving from mobile → desktop.
  useEffect(() => {
    if (!isDesktopViewport) return;
    if (!isMobileMenuOpen) return;
    closeMobileMenu();
  }, [closeMobileMenu, isDesktopViewport, isMobileMenuOpen]);

  // Clear hover state when the mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      if (isMobileViewport) setHoveredItem(null);
    }
  }, [isMobileMenuOpen, isMobileViewport, setHoveredItem]);

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
          <Logo href={menuItems.logo?.href} closeMobileMenu={closeMobileMenu} />
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
          <MenuToggle isOpen={isMobileMenuOpen} toggleMenu={toggleMobileMenu} />
        </AbsoluteItem>
      </motion.div>

      {/* Mobile Menu Modal */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        closeMenu={closeMobileMenu}
      />
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const Navigation = memo(NavigationComponent);

// Add display name for debugging
Navigation.displayName = "Navigation";
