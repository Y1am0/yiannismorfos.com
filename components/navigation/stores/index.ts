// Export all stores
export * from "./elementRegistryState";
export * from "./glassPillState";
export * from "./mobileMenuState";
export * from "./navigationState";

// Export middleware utilities
export * from "./zustandMiddleware";

// Convenience hooks that combine multiple stores
import { useCallback } from "react";
import { NAVIGATION_CATEGORIES } from "../constants";
import { NavigationItemId } from "../types";
import { useElementRegistryState } from "./elementRegistryState";
import { useGlassPillState } from "./glassPillState";
import { useMobileMenuState } from "./mobileMenuState";
import { useNavigationState } from "./navigationState";

/**
 * Combined hook for all navigation interactions
 * Provides a simplified interface that eliminates prop drilling
 */
export const useNavigationActions = () => {
  const setHoveredItem = useNavigationState((state) => state.setHoveredItem);
  const setPressedItem = useNavigationState((state) => state.setPressedItem);
  const setActiveItem = useNavigationState((state) => state.setActiveItem);
  const setLastClickedItem = useNavigationState(
    (state) => state.setLastClickedItem
  );
  const validateRouteChange = useNavigationState(
    (state) => state.validateRouteChange
  );

  // Shared timeout management from store
  const setExitTimeout = useNavigationState((state) => state.setExitTimeout);
  const clearAllTimeouts = useNavigationState(
    (state) => state.clearAllTimeouts
  );

  const closeMenu = useMobileMenuState((state) => state.closeMenu);
  const toggleMenu = useMobileMenuState((state) => state.toggleMenu);

  const updateGlassPillPosition = useGlassPillState(
    (state) => state.updatePosition
  );
  const setGlassPillVisible = useGlassPillState((state) => state.setIsVisible);

  const registerDesktopElement = useElementRegistryState(
    (state) => state.registerDesktopElement
  );
  const registerMobileElement = useElementRegistryState(
    (state) => state.registerMobileElement
  );
  const setParentElement = useElementRegistryState(
    (state) => state.setParentElement
  );

  // Get current state values without subscribing
  const getCurrentState = () => ({
    parentElement: useElementRegistryState.getState().parentElement,
    activeItem: useNavigationState.getState().activeItem,
    isMobile: useMobileMenuState.getState().isMobile,
    isMobileMenuOpen: useMobileMenuState.getState().isOpen,
    getDesktopElement: useElementRegistryState.getState().getDesktopElement,
    getMobileElement: useElementRegistryState.getState().getMobileElement,
  });

  // Combined handlers that coordinate multiple stores
  const handleHoverStart = useCallback(
    (item: NavigationItemId, element: Element) => {
      if (typeof window !== "undefined") {
        const nav: Navigator & { maxTouchPoints?: number } =
          navigator as Navigator & {
            maxTouchPoints?: number;
          };
        const isTouch =
          "ontouchstart" in window ||
          (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
          window.matchMedia("(pointer: coarse)").matches;
        if (isTouch) return; // Skip hover logic on touch devices
      }

      // Small-viewport gating: ignore hover unless it's a nav/blog item while mobile menu is open
      const { isMobile, isMobileMenuOpen } = getCurrentState();
      if (isMobile) {
        const isNav = NAVIGATION_CATEGORIES.navigationItems.includes(item);
        const isBlog = item === "blog";
        const allowHover = (isNav || isBlog) && isMobileMenuOpen;
        if (!allowHover) {
          return;
        }
      }
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[Navigation] Hover START: ${item}, mobile: ${
            getCurrentState().isMobile
          }`
        );
      }

      // Cancel any pending exit timeouts - user is moving to another item
      clearAllTimeouts();

      const { parentElement } = getCurrentState();
      setHoveredItem(item);
      if (parentElement) {
        // If hovering an item in mobile menu context, force positionMode to fixed
        const positionOverride: "absolute" | "fixed" | undefined =
          isMobileMenuOpen && isMobile ? "fixed" : undefined;
        // Pass explicit override type to updatePosition
        (
          updateGlassPillPosition as unknown as (
            e: Element,
            p: Element,
            m?: "absolute" | "fixed"
          ) => void
        )(element, parentElement, positionOverride);
      }
    },
    [setHoveredItem, updateGlassPillPosition, clearAllTimeouts]
  );

  const handleHoverEnd = useCallback(() => {
    if (typeof window !== "undefined") {
      const nav: Navigator & { maxTouchPoints?: number } =
        navigator as Navigator & {
          maxTouchPoints?: number;
        };
      const isTouch =
        "ontouchstart" in window ||
        (typeof nav.maxTouchPoints === "number" && nav.maxTouchPoints > 0) ||
        window.matchMedia("(pointer: coarse)").matches;
      if (isTouch) return; // Skip hover end logic on touch devices
    }
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[Navigation] Hover END, mobile: ${getCurrentState().isMobile}`
      );
    }

    const {
      parentElement,
      activeItem,
      isMobile,
      isMobileMenuOpen,
      getDesktopElement,
      getMobileElement,
    } = getCurrentState();

    const animationsComplete = useMobileMenuState.getState().animationsComplete;

    // Clear any existing timeouts
    clearAllTimeouts();

    // Short delay before handling exit - allows smooth flow between items
    const exitTimeoutId = setTimeout(() => {
      // Clear hovered item first
      setHoveredItem(null);

      // If there's an active item, try to return to it (with proper mobile logic)
      if (activeItem && parentElement) {
        const isLogoOrHamburger =
          activeItem === "logo" || activeItem === "menu";
        const isNavigationItem = NAVIGATION_CATEGORIES.navigationItems.includes(
          activeItem as NavigationItemId
        );
        const isBlogItem = activeItem === "blog";

        let activeElement = null;

        if (!isMobile) {
          // Desktop: always use desktop elements
          activeElement = getDesktopElement(activeItem);
        } else {
          // Mobile: use different logic based on item type
          if (isLogoOrHamburger) {
            // Logo/hamburger are always visible on mobile - use desktop elements
            activeElement = getDesktopElement(activeItem);
          } else if (
            (isNavigationItem || isBlogItem) &&
            isMobileMenuOpen &&
            animationsComplete
          ) {
            // Navigation items only work when mobile menu is open AND animations are complete - use mobile elements
            activeElement = getMobileElement(activeItem);
          }
          // If mobile menu is closed and it's a navigation item, activeElement stays null
        }

        if (activeElement) {
          // Smoothly move pill back to active item
          const positionOverride: "absolute" | "fixed" | undefined = isMobile
            ? isMobileMenuOpen
              ? "fixed"
              : "absolute"
            : undefined;
          // Pass explicit override type to updatePosition
          (
            updateGlassPillPosition as unknown as (
              e: Element,
              p: Element,
              m?: "absolute" | "fixed"
            ) => void
          )(activeElement, parentElement, positionOverride);
        } else {
          // Active element not found or not applicable - hide pill
          setGlassPillVisible(false);
        }
      } else {
        // No active item - trigger exit animation
        setGlassPillVisible(false);
      }
    }, 100); // Small delay allows smooth flow between items

    setExitTimeout(exitTimeoutId);
  }, [
    setHoveredItem,
    updateGlassPillPosition,
    setGlassPillVisible,
    clearAllTimeouts,
    setExitTimeout,
  ]);

  const handleMouseDown = useCallback(
    (item: NavigationItemId) => {
      setPressedItem(item);
    },
    [setPressedItem]
  );

  const handleMouseUp = useCallback(() => {
    setPressedItem(null);
  }, [setPressedItem]);

  const handleElementMount = useCallback(
    (item: NavigationItemId, element: Element) => {
      const { parentElement, activeItem, isMobile } = getCurrentState();

      registerDesktopElement(item, element);

      // If this is the active item on desktop, update glass pill position
      if (item === activeItem && !isMobile && parentElement) {
        updateGlassPillPosition(element, parentElement);
      }
    },
    [registerDesktopElement, updateGlassPillPosition]
  );

  const handleMobileElementMount = useCallback(
    (item: NavigationItemId, element: Element) => {
      const { parentElement, activeItem, isMobile, isMobileMenuOpen } =
        getCurrentState();

      registerMobileElement(item, element);

      // Only auto-position on active item if user is not currently hovering something else
      const currentHoveredItem = useNavigationState.getState().hoveredItem;

      // If this is the active item and mobile menu is open, and user isn't hovering anything else
      if (
        item === activeItem &&
        isMobile &&
        isMobileMenuOpen &&
        parentElement &&
        !currentHoveredItem
      ) {
        updateGlassPillPosition(element, parentElement);
      }
    },
    [registerMobileElement, updateGlassPillPosition]
  );

  const handleLogoClick = useCallback(() => {
    const { isMobileMenuOpen } = getCurrentState();
    if (isMobileMenuOpen) {
      closeMenu();
    }
  }, [closeMenu]);

  return {
    // Basic actions
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
    handleMobileElementMount,
    handleLogoClick,

    // Menu actions
    toggleMenu,
    closeMenu,

    // State setters
    setParentElement,
    setActiveItem,
    setLastClickedItem,
    validateRouteChange,

    // Direct store actions (for advanced use cases)
    setHoveredItem,
    setPressedItem,
    updateGlassPillPosition,
    setGlassPillVisible,
    registerDesktopElement,
    registerMobileElement,
  };
};

/**
 * Combined hook for navigation state reading
 * Provides optimized selectors for components
 */
export const useNavigationSelectors = () => {
  const hoveredItem = useNavigationState((state) => state.hoveredItem);
  const pressedItem = useNavigationState((state) => state.pressedItem);
  const activeItem = useNavigationState((state) => state.activeItem);
  const displayedItem = useNavigationState((state) => state.getDisplayedItem());

  const isMobileMenuOpen = useMobileMenuState((state) => state.isOpen);
  const isMobile = useMobileMenuState((state) => state.isMobile);
  const animationsComplete = useMobileMenuState(
    (state) => state.animationsComplete
  );

  const glassPillStyle = useGlassPillState((state) => state.backgroundStyle);
  const glassPillVisible = useGlassPillState((state) => state.isVisible);
  const glassPillPositionMode = useGlassPillState(
    (state) => state.positionMode
  );

  return {
    hoveredItem,
    pressedItem,
    activeItem,
    displayedItem,
    isMobileMenuOpen,
    isMobile,
    animationsComplete,
    glassPillStyle,
    glassPillVisible,
    glassPillPositionMode,
  };
};
