// Export all stores
export * from "./elementRegistryState";
export * from "./glassPillState";
export * from "./mobileMenuState";
export * from "./navigationState";

// Export middleware utilities
export * from "./zustandMiddleware";

// Convenience hooks that combine multiple stores
import { useCallback } from "react";
import {
  isExternalLinkId,
  isMusicPlayerButtonId,
  shouldAllowHover,
} from "../navigationPolicy";
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

  const setGlassPillVisible = useGlassPillState((state) => state.setIsVisible);

  const registerHeaderElement = useElementRegistryState(
    (state) => state.registerHeaderElement
  );
  const registerOverlayElement = useElementRegistryState(
    (state) => state.registerOverlayElement
  );
  const registerFixedElement = useElementRegistryState(
    (state) => state.registerFixedElement
  );
  const setParentElement = useElementRegistryState(
    (state) => state.setParentElement
  );

  // Get current state values without subscribing
  const getCurrentState = () => ({
    isMobile: useMobileMenuState.getState().isMobile,
    isMobileMenuOpen: useMobileMenuState.getState().isOpen,
  });

  // Combined handlers that coordinate multiple stores
  const handleHoverStart = useCallback(
    (item: NavigationItemId) => {
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
        if (
          !shouldAllowHover(item, {
            isMobileViewport: isMobile,
            isMobileMenuOpen,
          })
        ) {
          return;
        }
      }
      // Cancel any pending exit timeouts - user is moving to another item
      clearAllTimeouts();

      setHoveredItem(item);
    },
    [setHoveredItem, clearAllTimeouts]
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

    // Clear any existing timeouts
    clearAllTimeouts();

    // Short delay before handling exit - allows smooth flow between items
    const exitTimeoutId = setTimeout(() => {
      setHoveredItem(null);
    }, 100); // Small delay allows smooth flow between items

    setExitTimeout(exitTimeoutId);
  }, [setHoveredItem, clearAllTimeouts, setExitTimeout]);

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
      if (isExternalLinkId(item) || isMusicPlayerButtonId(item)) {
        registerFixedElement(item, element);
      } else {
        registerHeaderElement(item, element);
      }
    },
    [registerFixedElement, registerHeaderElement]
  );

  const handleMobileElementMount = useCallback(
    (item: NavigationItemId, element: Element) => {
      registerOverlayElement(item, element);
    },
    [registerOverlayElement]
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
    setGlassPillVisible,
    registerHeaderElement,
    registerOverlayElement,
    registerFixedElement,
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
    isMobileMenuOpen,
    isMobile,
    animationsComplete,
    glassPillStyle,
    glassPillVisible,
    glassPillPositionMode,
  };
};
