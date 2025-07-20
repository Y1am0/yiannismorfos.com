import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BackgroundStyle } from "../types";

interface GlassPillState {
  // State
  backgroundStyle: BackgroundStyle;
  isVisible: boolean;

  // Actions
  setBackgroundStyle: (style: BackgroundStyle) => void;
  setIsVisible: (visible: boolean) => void;
  updatePosition: (element: Element, parentElement: Element | null) => void;

  // Computed values
  getCircularSize: (isCircular: boolean) => number;
  getAdjustedPosition: (isCircular: boolean) => { left: number; top: number };
}

const CIRCULAR_PILL_SIZE = 80;

export const useGlassPillState = create<GlassPillState>()(
  devtools(
    (set, get) => ({
      // Initial state
      backgroundStyle: {
        width: 0,
        left: 0,
        height: 0,
        top: 0,
      },
      isVisible: false,

      // Actions
      setBackgroundStyle: (style) =>
        set({ backgroundStyle: style }, false, "setBackgroundStyle"),

      setIsVisible: (visible) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[GlassPill] Visibility changed to: ${visible}`);
        }
        set({ isVisible: visible }, false, "setIsVisible");
      },

      updatePosition: (element, parentElement) => {
        if (!parentElement) return;

        const referenceRect = parentElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Check if the element is in a mobile menu by detecting if it's in a fixed positioned container
        // More robust check: if element is far from reference (mobile menu) or if top position is significantly different
        const isInMobileMenu =
          Math.abs(elementRect.top - referenceRect.top) > 100 ||
          elementRect.top > window.innerHeight * 0.2; // Mobile menu items are typically in center/lower part of screen

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[GlassPill] Positioning element, isMobileMenu: ${isInMobileMenu}, elementTop: ${elementRect.top}, referenceTop: ${referenceRect.top}`
          );
        }

        let newStyle: BackgroundStyle;

        if (isInMobileMenu) {
          // For mobile menu items, use viewport coordinates directly since the glass pill will be fixed positioned
          newStyle = {
            width: elementRect.width,
            left: elementRect.left,
            height: elementRect.height,
            top: elementRect.top,
          };
        } else {
          // For navigation bar items, calculate relative to the navigation container
          newStyle = {
            width: elementRect.width,
            left: elementRect.left - referenceRect.left,
            height: elementRect.height,
            top: elementRect.top - referenceRect.top,
          };
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`[GlassPill] New style:`, newStyle);
        }

        set(
          {
            backgroundStyle: newStyle,
            isVisible: true,
          },
          false,
          "updatePosition"
        );
      },

      // Computed values
      getCircularSize: (isCircular) => {
        const state = get();
        return isCircular
          ? CIRCULAR_PILL_SIZE
          : Math.max(state.backgroundStyle.width, state.backgroundStyle.height);
      },

      getAdjustedPosition: (isCircular) => {
        const state = get();
        const circularSize = state.getCircularSize(isCircular);

        return isCircular
          ? {
              left:
                state.backgroundStyle.left +
                (state.backgroundStyle.width - circularSize) / 2,
              top:
                state.backgroundStyle.top +
                (state.backgroundStyle.height - circularSize) / 2,
            }
          : {
              left: state.backgroundStyle.left,
              top: state.backgroundStyle.top,
            };
      },
    }),
    {
      name: "glass-pill-state",
    }
  )
);

// Selectors for performance optimization
export const selectBackgroundStyle = (state: GlassPillState) =>
  state.backgroundStyle;
export const selectIsVisible = (state: GlassPillState) => state.isVisible;
export const selectCircularSize =
  (isCircular: boolean) => (state: GlassPillState) =>
    state.getCircularSize(isCircular);
export const selectAdjustedPosition =
  (isCircular: boolean) => (state: GlassPillState) =>
    state.getAdjustedPosition(isCircular);
