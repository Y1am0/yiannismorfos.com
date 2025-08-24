import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BackgroundStyle } from "../types";

interface GlassPillState {
  // State
  backgroundStyle: BackgroundStyle;
  isVisible: boolean;
  positionMode: "absolute" | "fixed";

  // Actions
  setBackgroundStyle: (style: BackgroundStyle) => void;
  setIsVisible: (visible: boolean) => void;
  updatePosition: (
    element: Element,
    parentElement: Element | null,
    positionModeOverride?: "absolute" | "fixed"
  ) => void;

  // (Intentionally no computed values here; keep logic in components/constants)
}

export const useGlassPillState = create<GlassPillState>()(
  devtools(
    (set) => ({
      // Initial state
      backgroundStyle: {
        width: 0,
        left: 0,
        height: 0,
        top: 0,
      },
      isVisible: false,
      positionMode: "absolute",

      // Actions
      setBackgroundStyle: (style) =>
        set({ backgroundStyle: style }, false, "setBackgroundStyle"),

      setIsVisible: (visible) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[GlassPill] Visibility changed to: ${visible}`);
        }
        set({ isVisible: visible }, false, "setIsVisible");
      },

      updatePosition: (element, parentElement, positionModeOverride) => {
        if (!parentElement) return;

        const referenceRect = parentElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Check if the element is in a mobile menu by detecting if it's in a fixed positioned container
        // More robust check: if element is far from reference (mobile menu) or if top position is significantly different
        const isInMobileMenu = positionModeOverride
          ? positionModeOverride === "fixed"
          : Math.abs(elementRect.top - referenceRect.top) > 100 ||
            elementRect.top > window.innerHeight * 0.2; // Mobile menu items are typically in center/lower part of screen

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[GlassPill] Positioning element, isMobileMenu: ${isInMobileMenu}, elementTop: ${elementRect.top}, referenceTop: ${referenceRect.top}`
          );
        }

        let newStyle: BackgroundStyle;
        const positionMode: "absolute" | "fixed" = isInMobileMenu
          ? "fixed"
          : "absolute";

        if (isInMobileMenu) {
          // For mobile menu items, use viewport coordinates directly since the glass pill will be fixed positioned
          newStyle = {
            width: Math.round(elementRect.width),
            left: Math.round(elementRect.left),
            height: Math.round(elementRect.height),
            top: Math.round(elementRect.top),
          };
        } else {
          // For navigation bar items, calculate relative to the navigation container
          newStyle = {
            width: Math.round(elementRect.width),
            left: Math.round(elementRect.left - referenceRect.left),
            height: Math.round(elementRect.height),
            top: Math.round(elementRect.top - referenceRect.top),
          };
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`[GlassPill] New style:`, newStyle);
        }

        set(
          {
            backgroundStyle: newStyle,
            isVisible: true,
            positionMode,
          },
          false,
          "updatePosition"
        );
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
export const selectPositionMode = (state: GlassPillState) => state.positionMode;
