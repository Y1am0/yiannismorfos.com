import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MobileMenuState {
  // State
  isOpen: boolean;
  isMobile: boolean;
  justOpened: boolean; // Track when menu just opened to prevent immediate positioning

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  openMenu: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setJustOpened: (justOpened: boolean) => void;

  // Computed values
  shouldShowMobileMenu: () => boolean;
}

export const useMobileMenuState = create<MobileMenuState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isOpen: false,
      isMobile: false,
      justOpened: false,

      // Actions
      setIsOpen: (isOpen) => set({ isOpen }, false, "setIsOpen"),
      toggleMenu: () => {
        const currentState = get();
        const newIsOpen = !currentState.isOpen;
        set(
          {
            isOpen: newIsOpen,
            justOpened: newIsOpen, // Set justOpened when opening
          },
          false,
          "toggleMenu"
        );

        // Clear justOpened flag after brief delay
        if (newIsOpen) {
          setTimeout(() => {
            set({ justOpened: false }, false, "clearJustOpened");
          }, 150);
        }
      },
      closeMenu: () =>
        set({ isOpen: false, justOpened: false }, false, "closeMenu"),
      openMenu: () => {
        set({ isOpen: true, justOpened: true }, false, "openMenu");
        // Clear justOpened flag after brief delay
        setTimeout(() => {
          set({ justOpened: false }, false, "clearJustOpened");
        }, 150);
      },
      setIsMobile: (isMobile) => set({ isMobile }, false, "setIsMobile"),
      setJustOpened: (justOpened) =>
        set({ justOpened }, false, "setJustOpened"),

      // Computed values
      shouldShowMobileMenu: () => {
        const state = get();
        return state.isMobile && state.isOpen;
      },
    }),
    {
      name: "mobile-menu-state",
    }
  )
);

// Selectors for performance optimization
export const selectIsOpen = (state: MobileMenuState) => state.isOpen;
export const selectIsMobile = (state: MobileMenuState) => state.isMobile;
export const selectJustOpened = (state: MobileMenuState) => state.justOpened;
export const selectShouldShowMobileMenu = (state: MobileMenuState) =>
  state.shouldShowMobileMenu();
