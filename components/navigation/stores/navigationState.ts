import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { MENU_ITEMS } from "../menu-items";

import { NavigationItemId } from "../types";

interface NavigationState {
  // State
  hoveredItem: NavigationItemId | null;
  pressedItem: NavigationItemId | null;
  activeItem: NavigationItemId | null;
  lastClickedItem: NavigationItemId | null; // Track what was clicked to validate route changes

  // Timeout management for hover exit delays
  exitTimeoutId: NodeJS.Timeout | null;
  clearHoverTimeoutId: NodeJS.Timeout | null;

  // Actions
  setHoveredItem: (item: NavigationItemId | null) => void;
  setPressedItem: (item: NavigationItemId | null) => void;
  setActiveItem: (item: NavigationItemId | null) => void;
  setLastClickedItem: (item: NavigationItemId | null) => void;

  // Route validation
  validateRouteChange: (expectedItemId: NavigationItemId | null) => void;

  // Timeout management
  setExitTimeout: (timeoutId: NodeJS.Timeout) => void;
  setClearHoverTimeout: (timeoutId: NodeJS.Timeout) => void;
  clearAllTimeouts: () => void;

  // Computed values with selectors
  getDisplayedItem: () => NavigationItemId | null;
}

export const useNavigationState = create<NavigationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      hoveredItem: null,
      pressedItem: null,
      activeItem: null,
      lastClickedItem: null,
      exitTimeoutId: null,
      clearHoverTimeoutId: null,

      // Actions
      setHoveredItem: (item) =>
        set({ hoveredItem: item }, false, "setHoveredItem"),
      setPressedItem: (item) =>
        set({ pressedItem: item }, false, "setPressedItem"),
      setActiveItem: (item) =>
        set({ activeItem: item }, false, "setActiveItem"),
      setLastClickedItem: (item) =>
        set({ lastClickedItem: item }, false, "setLastClickedItem"),

      // Route validation
      validateRouteChange: (actualRouteItemId) => {
        const state = get();
        if (state.lastClickedItem) {
          // If we clicked an item but the route didn't change to match it, revert to actual route
          if (actualRouteItemId !== state.lastClickedItem) {
            // Route didn't change as expected (e.g., clicked same route), revert to actual route item
            set(
              { activeItem: actualRouteItemId },
              false,
              "revertToActualRoute"
            );
          }
          // If route did change as expected, activeItem is already correct from the click
        } else {
          // No click happened, just a regular route change (e.g., browser back/forward)
          set({ activeItem: actualRouteItemId }, false, "routeChangeOnly");
        }
        // Clear the last clicked item after validation
        set({ lastClickedItem: null }, false, "clearLastClickedItem");
      },

      // Timeout management
      setExitTimeout: (timeoutId) =>
        set({ exitTimeoutId: timeoutId }, false, "setExitTimeout"),
      setClearHoverTimeout: (timeoutId) =>
        set({ clearHoverTimeoutId: timeoutId }, false, "setClearHoverTimeout"),

      clearAllTimeouts: () => {
        const state = get();

        if (state.exitTimeoutId) {
          clearTimeout(state.exitTimeoutId);
        }
        if (state.clearHoverTimeoutId) {
          clearTimeout(state.clearHoverTimeoutId);
        }

        set(
          { exitTimeoutId: null, clearHoverTimeoutId: null },
          false,
          "clearAllTimeouts"
        );
      },

      // Computed values
      getDisplayedItem: () => {
        const state = get();
        return state.hoveredItem || state.activeItem;
      },
    }),
    {
      name: "navigation-state",
    }
  )
);

// Selectors for performance optimization
export const selectHoveredItem = (state: NavigationState) => state.hoveredItem;
export const selectPressedItem = (state: NavigationState) => state.pressedItem;
export const selectActiveItem = (state: NavigationState) => state.activeItem;
export const selectDisplayedItem = (state: NavigationState) =>
  state.getDisplayedItem();

// Helper to initialize active item based on pathname
export const useActiveItemFromPathname = (pathname: string) => {
  const setActiveItem = useNavigationState((state) => state.setActiveItem);

  const currentItem = MENU_ITEMS.find((item) => {
    // Exclude homepage (logo) from active state
    if (item.type === "logo") return false;
    return pathname === item.href;
  });

  setActiveItem((currentItem?.id as NavigationItemId) || null);
};
