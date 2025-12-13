import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { NavigationItemId } from "../types";

type TimeoutHandle = ReturnType<typeof setTimeout>;

interface NavigationState {
  // State
  hoveredItem: NavigationItemId | null;
  pressedItem: NavigationItemId | null;
  activeItem: NavigationItemId | null;
  lastClickedItem: NavigationItemId | null; // Track what was clicked to validate route changes
  lastDisplayedItem: NavigationItemId | null; // Last non-null displayed (hovered or active)
  exitingItem: NavigationItemId | null; // Item that is currently animating pill exit

  // Timeout management for hover exit delays
  exitTimeoutId: TimeoutHandle | null;

  // Actions
  setHoveredItem: (item: NavigationItemId | null) => void;
  setPressedItem: (item: NavigationItemId | null) => void;
  setActiveItem: (item: NavigationItemId | null) => void;
  setLastClickedItem: (item: NavigationItemId | null) => void;
  clearExitingItem: () => void;

  // Route validation
  validateRouteChange: (expectedItemId: NavigationItemId | null) => void;

  // Timeout management
  setExitTimeout: (timeoutId: TimeoutHandle) => void;
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
      lastDisplayedItem: null,
      exitingItem: null,
      exitTimeoutId: null,

      // Actions
      setHoveredItem: (item) =>
        set(
          (state) => {
            const nextHoveredItem = item;
            const nextLastDisplayedItem =
              nextHoveredItem ?? state.lastDisplayedItem;
            const nextDisplayedItem = nextHoveredItem ?? state.activeItem;
            const nextExitingItem = nextDisplayedItem
              ? null
              : state.exitingItem ?? nextLastDisplayedItem;

            return {
              hoveredItem: nextHoveredItem,
              lastDisplayedItem: nextLastDisplayedItem,
              exitingItem: nextExitingItem,
            };
          },
          false,
          "setHoveredItem"
        ),
      setPressedItem: (item) =>
        set({ pressedItem: item }, false, "setPressedItem"),
      setActiveItem: (item) =>
        set(
          (state) => {
            const nextActiveItem = item;
            const nextLastDisplayedItem =
              nextActiveItem ?? state.lastDisplayedItem;
            const nextDisplayedItem = state.hoveredItem ?? nextActiveItem;
            const nextExitingItem = nextDisplayedItem
              ? null
              : state.exitingItem ?? nextLastDisplayedItem;

            return {
              activeItem: nextActiveItem,
              lastDisplayedItem: nextLastDisplayedItem,
              exitingItem: nextExitingItem,
            };
          },
          false,
          "setActiveItem"
        ),
      setLastClickedItem: (item) =>
        set({ lastClickedItem: item }, false, "setLastClickedItem"),
      clearExitingItem: () =>
        set({ exitingItem: null }, false, "clearExitingItem"),

      // Route validation
      validateRouteChange: (actualRouteItemId) => {
        set(
          (state) => {
            let nextActiveItem = state.activeItem;

            if (state.lastClickedItem) {
              // If we clicked an item but the route didn't change to match it, revert to actual route
              if (actualRouteItemId !== state.lastClickedItem) {
                nextActiveItem = actualRouteItemId;
              }
              // If route did change as expected, activeItem is already correct from the click
            } else {
              // No click happened, just a regular route change (e.g., browser back/forward)
              nextActiveItem = actualRouteItemId;
            }

            const nextLastDisplayedItem =
              nextActiveItem ?? state.lastDisplayedItem;
            const nextDisplayedItem = state.hoveredItem ?? nextActiveItem;
            const nextExitingItem = nextDisplayedItem
              ? null
              : state.exitingItem ?? nextLastDisplayedItem;

            return {
              activeItem: nextActiveItem,
              lastClickedItem: null,
              lastDisplayedItem: nextLastDisplayedItem,
              exitingItem: nextExitingItem,
            };
          },
          false,
          "validateRouteChange"
        );
      },

      // Timeout management
      setExitTimeout: (timeoutId) =>
        set({ exitTimeoutId: timeoutId }, false, "setExitTimeout"),

      clearAllTimeouts: () => {
        const state = get();

        if (state.exitTimeoutId) {
          clearTimeout(state.exitTimeoutId);
        }

        set(
          { exitTimeoutId: null },
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
