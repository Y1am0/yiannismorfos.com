"use client";

import { Quote } from "lucide-react";
import { usePathname } from "next/navigation";
import { memo, useEffect, useMemo, useRef } from "react";
import { AbsoluteItem } from "./AbsoluteItem";
import { Z_INDEX } from "./constants";

import { GlassPill } from "./GlassPill";
import { Logo } from "./Logo";
import { getBlogItem, getLogoItem, getNavigationItems } from "./menu-items";
import { MenuToggle } from "./MenuToggle";
import { MobileMenu } from "./MobileMenu";

import { NavigationItem } from "./NavigationItem";
import { useElementRegistryState } from "./stores/elementRegistryState";
import { useNavigationActions, useNavigationSelectors } from "./stores/index";
import { useMobileMenuState } from "./stores/mobileMenuState";
import { useNavigationState } from "./stores/navigationState";

const NavigationComponent = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const {
    displayedItem,
    isMobile,
    activeItem,
    isMobileMenuOpen,
    hoveredItem,
    justOpened,
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
    const currentItem = menuItems.navigation.find(
      (item) => pathname === item.href
    );
    setActiveItem(currentItem?.id || null);
  }, [pathname, setActiveItem, menuItems.navigation]);

  // Set up mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = useMobileMenuState.getState().isMobile;
      const isNowMobile = window.innerWidth < 768;

      setIsMobile(isNowMobile);

      // Auto-close mobile menu when transitioning from mobile to desktop
      if (wasMobile && !isNowMobile && isMobileMenuOpen) {
        const { closeMenu } = useMobileMenuState.getState();
        closeMenu();
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
        const isNavigationItem = ["hello", "who", "what", "connect"].includes(
          currentDisplayedItem
        );
        const isBlogItem = currentDisplayedItem === "blog";

        if (isLogoOrHamburger) {
          // Logo and hamburger are always visible on mobile - use desktop elements
          const displayedDesktopElement =
            getDesktopElement(currentDisplayedItem);
          if (displayedDesktopElement) {
            updateGlassPillPosition(displayedDesktopElement, parentElement);
          } else {
            setGlassPillVisible(false);
          }
        } else if ((isNavigationItem || isBlogItem) && isMobileMenuOpen) {
          // Navigation items and blog are ONLY visible when mobile menu is open - use mobile elements
          if (hoveredItem) {
            // User is actively hovering - respect that
            const displayedMobileElement =
              getMobileElement(currentDisplayedItem);
            if (displayedMobileElement) {
              updateGlassPillPosition(displayedMobileElement, parentElement);
            } else {
              setGlassPillVisible(false);
            }
          } else if (currentDisplayedItem === activeItem && !justOpened) {
            // No hover, and we're dealing with active item, and menu didn't just open
            // Use delayed positioning to avoid race conditions when mobile menu opens
            const checkMobileElement = () => {
              // Re-check hover state when timeout executes - don't override active hover
              const currentHoverState =
                useNavigationState.getState().hoveredItem;
              if (currentHoverState) {
                // User started hovering something while we were waiting - abort positioning on active item
                return;
              }

              const displayedMobileElement =
                getMobileElement(currentDisplayedItem);
              if (displayedMobileElement) {
                updateGlassPillPosition(displayedMobileElement, parentElement);
              } else {
                // Retry after a short delay if element not found
                setTimeout(checkMobileElement, 50);
              }
            };

            // Add delay to allow mobile menu to finish opening animation
            setTimeout(checkMobileElement, 400);
          } else if (currentDisplayedItem === activeItem && justOpened) {
            // Menu just opened and we're dealing with active item - use longer delay to allow hover state to stabilize
            const checkMobileElement = () => {
              // Re-check hover state when timeout executes - don't override active hover
              const currentHoverState =
                useNavigationState.getState().hoveredItem;
              if (currentHoverState) {
                // User started hovering something while we were waiting - abort positioning on active item
                return;
              }

              const displayedMobileElement =
                getMobileElement(currentDisplayedItem);
              if (displayedMobileElement) {
                updateGlassPillPosition(displayedMobileElement, parentElement);
              } else {
                // Retry after a short delay if element not found
                setTimeout(checkMobileElement, 50);
              }
            };

            // Longer delay when menu just opened to allow click event and hover state to stabilize
            setTimeout(checkMobileElement, 600);
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
    getDesktopElement,
    getMobileElement,
    updateGlassPillPosition,
    setGlassPillVisible,
    justOpened,
  ]);

  // Handle window resize - reposition glass pill if visible
  useEffect(() => {
    const handleResize = () => {
      // Only reposition if pill should be visible
      if (activeItem && parentElement) {
        const isLogoOrHamburger =
          activeItem === "logo" || activeItem === "menu";
        const isNavigationItem = ["hello", "who", "what", "connect"].includes(
          activeItem
        );
        const isBlogItem = activeItem === "blog";

        if (!isMobile) {
          // Desktop: reposition on desktop element
          const activeElement = getDesktopElement(activeItem);
          if (activeElement) {
            updateGlassPillPosition(activeElement, parentElement);
          }
        } else {
          // Mobile: different logic based on item type
          if (isLogoOrHamburger) {
            // Logo/hamburger always use desktop elements (always visible)
            const activeElement = getDesktopElement(activeItem);
            if (activeElement) {
              updateGlassPillPosition(activeElement, parentElement);
            }
          } else if ((isNavigationItem || isBlogItem) && isMobileMenuOpen) {
            // Navigation items only work when mobile menu is open (use mobile elements)
            const activeElement = getMobileElement(activeItem);
            if (activeElement) {
              updateGlassPillPosition(activeElement, parentElement);
            }
          }
          // If mobile menu is closed and it's a navigation item, do nothing (pill should be hidden)
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    activeItem,
    parentElement,
    isMobile,
    isMobileMenuOpen,
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
      <div
        ref={parentRef}
        className="w-full text-white max-w-screen-2xl mx-auto flex justify-center px-4 lg:px-12 py-8 relative"
        style={{ zIndex: Z_INDEX.navigationOverlay }}
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
      </div>

      {/* Mobile Menu Modal */}
      <MobileMenu />
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const Navigation = memo(NavigationComponent);

// Add display name for debugging
Navigation.displayName = "Navigation";
