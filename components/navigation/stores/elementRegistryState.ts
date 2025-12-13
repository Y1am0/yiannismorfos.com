import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { NavigationItemId } from "../types";

interface ElementRegistryState {
  // State
  headerElements: Map<NavigationItemId, Element>; // absolute-positioned (top nav)
  overlayElements: Map<NavigationItemId, Element>; // fixed-positioned (mobile menu)
  fixedElements: Map<NavigationItemId, Element>; // fixed-positioned (footer: external links, music)
  parentElement: Element | null;

  // Revision counters (used to trigger pill sync when elements mount/unmount)
  headerRevision: number;
  overlayRevision: number;
  fixedRevision: number;

  // Actions
  registerHeaderElement: (item: NavigationItemId, element: Element) => void;
  registerOverlayElement: (item: NavigationItemId, element: Element) => void;
  registerFixedElement: (item: NavigationItemId, element: Element) => void;
  setParentElement: (element: Element | null) => void;
  clearOverlayRegistry: () => void;
  clearHeaderRegistry: () => void;
  clearFixedRegistry: () => void;
  clearAllRegistries: () => void;

  // Getters
  getHeaderElement: (item: NavigationItemId) => Element | null;
  getOverlayElement: (item: NavigationItemId) => Element | null;
  getFixedElement: (item: NavigationItemId) => Element | null;
}

export const useElementRegistryState = create<ElementRegistryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      headerElements: new Map(),
      overlayElements: new Map(),
      fixedElements: new Map(),
      parentElement: null,
      headerRevision: 0,
      overlayRevision: 0,
      fixedRevision: 0,

      // Actions
      registerHeaderElement: (item, element) => {
        const state = get();

        const newHeaderElements = new Map(state.headerElements);
        newHeaderElements.set(item, element);

        set(
          {
            headerElements: newHeaderElements,
            headerRevision: state.headerRevision + 1,
          },
          false,
          "registerHeaderElement"
        );
      },

      registerOverlayElement: (item, element) => {
        const state = get();

        const newOverlayElements = new Map(state.overlayElements);
        newOverlayElements.set(item, element);

        set(
          {
            overlayElements: newOverlayElements,
            overlayRevision: state.overlayRevision + 1,
          },
          false,
          "registerOverlayElement"
        );
      },

      registerFixedElement: (item, element) => {
        const state = get();
        const newFixedElements = new Map(state.fixedElements);
        newFixedElements.set(item, element);

        set(
          {
            fixedElements: newFixedElements,
            fixedRevision: state.fixedRevision + 1,
          },
          false,
          "registerFixedElement"
        );
      },

      setParentElement: (element) =>
        set({ parentElement: element }, false, "setParentElement"),

      clearOverlayRegistry: () =>
        set(
          {
            overlayElements: new Map(),
            overlayRevision: get().overlayRevision + 1,
          },
          false,
          "clearOverlayRegistry"
        ),

      clearHeaderRegistry: () =>
        set(
          {
            headerElements: new Map(),
            headerRevision: get().headerRevision + 1,
          },
          false,
          "clearHeaderRegistry"
        ),

      clearFixedRegistry: () =>
        set(
          {
            fixedElements: new Map(),
            fixedRevision: get().fixedRevision + 1,
          },
          false,
          "clearFixedRegistry"
        ),

      clearAllRegistries: () =>
        set(
          {
            headerElements: new Map(),
            overlayElements: new Map(),
            fixedElements: new Map(),
            headerRevision: get().headerRevision + 1,
            overlayRevision: get().overlayRevision + 1,
            fixedRevision: get().fixedRevision + 1,
          },
          false,
          "clearAllRegistries"
        ),

      // Getters
      getHeaderElement: (item) => {
        const state = get();
        return state.headerElements.get(item) || null;
      },

      getOverlayElement: (item) => {
        const state = get();
        return state.overlayElements.get(item) || null;
      },

      getFixedElement: (item) => {
        const state = get();
        return state.fixedElements.get(item) || null;
      },
    }),
    {
      name: "element-registry-state",
    }
  )
);

// Selectors for performance optimization
export const selectHeaderElement =
  (item: NavigationItemId) => (state: ElementRegistryState) =>
    state.getHeaderElement(item);
export const selectOverlayElement =
  (item: NavigationItemId) => (state: ElementRegistryState) =>
    state.getOverlayElement(item);
export const selectFixedElement =
  (item: NavigationItemId) => (state: ElementRegistryState) =>
    state.getFixedElement(item);
export const selectParentElement = (state: ElementRegistryState) =>
  state.parentElement;
