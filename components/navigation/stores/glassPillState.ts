import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BackgroundStyle } from "../types";
import type { PillPositionMode } from "../navigationPolicy";

interface GlassPillState {
  // State
  backgroundStyle: BackgroundStyle;
  isVisible: boolean;
  positionMode: PillPositionMode;

  // Actions
  setBackgroundStyle: (style: BackgroundStyle) => void;
  setIsVisible: (visible: boolean) => void;
  updatePosition: (
    element: Element,
    parentElement: Element | null,
    positionMode: PillPositionMode
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
        set({ isVisible: visible }, false, "setIsVisible");
      },

      updatePosition: (element, parentElement, positionMode) => {
        const elementRect = element.getBoundingClientRect();
        let newStyle: BackgroundStyle;
        if (positionMode === "fixed") {
          newStyle = {
            width: Math.round(elementRect.width),
            left: Math.round(elementRect.left),
            height: Math.round(elementRect.height),
            top: Math.round(elementRect.top),
          };
        } else {
          if (!parentElement) return;
          const referenceRect = parentElement.getBoundingClientRect();
          newStyle = {
            width: Math.round(elementRect.width),
            left: Math.round(elementRect.left - referenceRect.left),
            height: Math.round(elementRect.height),
            top: Math.round(elementRect.top - referenceRect.top),
          };
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
