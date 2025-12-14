// Export all stores
export * from "./navigationState";

// Convenience hooks that combine multiple stores
import { useCallback } from "react";
import type { NavigationItemId } from "../config/navigationConfig";
import { isCoarsePointerDevice } from "../utils/pointer";
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
  const clearExitingItem = useNavigationState(
    (state) => state.clearExitingItem
  );
  const validateRouteChange = useNavigationState(
    (state) => state.validateRouteChange
  );

  // Shared timeout management from store
  const setExitTimeout = useNavigationState((state) => state.setExitTimeout);
  const clearAllTimeouts = useNavigationState(
    (state) => state.clearAllTimeouts
  );

  // Combined handlers that coordinate multiple stores
  const handleHoverStart = useCallback(
    (item: NavigationItemId) => {
      if (isCoarsePointerDevice()) return; // Skip hover logic on coarse pointers/touch

      // Cancel any pending exit timeouts - user is moving to another item
      clearAllTimeouts();

      setHoveredItem(item);
    },
    [setHoveredItem, clearAllTimeouts]
  );

  const handleHoverEnd = useCallback(() => {
    if (isCoarsePointerDevice()) return; // Skip hover end logic on coarse pointers/touch

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

  return {
    // Basic actions
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,

    // State setters
    setActiveItem,
    setLastClickedItem,
    validateRouteChange,
    clearExitingItem,

    // Direct store actions (for advanced use cases)
    setHoveredItem,
    setPressedItem,
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

  return {
    hoveredItem,
    pressedItem,
    activeItem,
  };
};
