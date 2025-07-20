import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MobileMenuState {
  // State
  isOpen: boolean;
  isMobile: boolean;
  animationsComplete: boolean; // Track when mobile menu stagger animations are done

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  openMenu: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setAnimationsComplete: (complete: boolean) => void;

  // Computed values
  shouldShowMobileMenu: () => boolean;
}

export const useMobileMenuState = create<MobileMenuState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isOpen: false,
      isMobile: false,
      animationsComplete: false,

      // Actions
      setIsOpen: (isOpen) =>
        set(
          { isOpen, animationsComplete: isOpen ? false : true },
          false,
          "setIsOpen"
        ),
      toggleMenu: () => {
        const currentState = get();
        const newIsOpen = !currentState.isOpen;
        set(
          { isOpen: newIsOpen, animationsComplete: newIsOpen ? false : true },
          false,
          "toggleMenu"
        );

        // Set animations complete after stagger animation finishes
        if (newIsOpen) {
          // Wait for the last item's animation (0.2 + 4 * 0.1 = 0.6s) plus a small buffer
          setTimeout(() => {
            const currentState = get();
            if (currentState.isOpen) {
              // Only set if menu is still open
              set({ animationsComplete: true }, false, "setAnimationsComplete");
            }
          }, 700);
        }
      },
      closeMenu: () =>
        set({ isOpen: false, animationsComplete: true }, false, "closeMenu"),
      openMenu: () => {
        set({ isOpen: true, animationsComplete: false }, false, "openMenu");
        // Set animations complete after stagger animation finishes
        setTimeout(() => {
          const currentState = get();
          if (currentState.isOpen) {
            // Only set if menu is still open
            set({ animationsComplete: true }, false, "setAnimationsComplete");
          }
        }, 700);
      },
      setIsMobile: (isMobile) => set({ isMobile }, false, "setIsMobile"),
      setAnimationsComplete: (complete) =>
        set({ animationsComplete: complete }, false, "setAnimationsComplete"),

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
export const selectAnimationsComplete = (state: MobileMenuState) =>
  state.animationsComplete;
export const selectShouldShowMobileMenu = (state: MobileMenuState) =>
  state.shouldShowMobileMenu();
