import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ElementRegistryState {
  // State
  desktopElements: Map<string, Element>;
  mobileElements: Map<string, Element>;
  registeredDesktopItems: Set<string>;
  registeredMobileItems: Set<string>;
  parentElement: Element | null;

  // Actions
  registerDesktopElement: (item: string, element: Element) => void;
  registerMobileElement: (item: string, element: Element) => void;
  setParentElement: (element: Element | null) => void;
  clearMobileRegistry: () => void;
  clearDesktopRegistry: () => void;
  clearAllRegistries: () => void;

  // Getters
  getDesktopElement: (item: string) => Element | null;
  getMobileElement: (item: string) => Element | null;
  isDesktopElementRegistered: (item: string) => boolean;
  isMobileElementRegistered: (item: string) => boolean;
}

export const useElementRegistryState = create<ElementRegistryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      desktopElements: new Map(),
      mobileElements: new Map(),
      registeredDesktopItems: new Set(),
      registeredMobileItems: new Set(),
      parentElement: null,

      // Actions
      registerDesktopElement: (item, element) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[ElementRegistry] Registering desktop element: ${item}`);
        }

        const state = get();

        const newDesktopElements = new Map(state.desktopElements);
        const newRegisteredDesktopItems = new Set(state.registeredDesktopItems);

        newDesktopElements.set(item, element);
        newRegisteredDesktopItems.add(item);

        set(
          {
            desktopElements: newDesktopElements,
            registeredDesktopItems: newRegisteredDesktopItems,
          },
          false,
          "registerDesktopElement"
        );
      },

      registerMobileElement: (item, element) => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[ElementRegistry] Registering mobile element: ${item}`);
        }

        const state = get();

        const newMobileElements = new Map(state.mobileElements);
        const newRegisteredMobileItems = new Set(state.registeredMobileItems);

        newMobileElements.set(item, element);
        newRegisteredMobileItems.add(item);

        set(
          {
            mobileElements: newMobileElements,
            registeredMobileItems: newRegisteredMobileItems,
          },
          false,
          "registerMobileElement"
        );
      },

      setParentElement: (element) =>
        set({ parentElement: element }, false, "setParentElement"),

      clearMobileRegistry: () => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[ElementRegistry] Clearing mobile registry`);
        }

        set(
          {
            mobileElements: new Map(),
            registeredMobileItems: new Set(),
          },
          false,
          "clearMobileRegistry"
        );
      },

      clearDesktopRegistry: () =>
        set(
          {
            desktopElements: new Map(),
            registeredDesktopItems: new Set(),
          },
          false,
          "clearDesktopRegistry"
        ),

      clearAllRegistries: () =>
        set(
          {
            desktopElements: new Map(),
            mobileElements: new Map(),
            registeredDesktopItems: new Set(),
            registeredMobileItems: new Set(),
          },
          false,
          "clearAllRegistries"
        ),

      // Getters
      getDesktopElement: (item) => {
        const state = get();
        return state.desktopElements.get(item) || null;
      },

      getMobileElement: (item) => {
        const state = get();
        const element = state.mobileElements.get(item) || null;

        if (process.env.NODE_ENV === "development") {
          console.log(
            `[ElementRegistry] Getting mobile element for ${item}: ${
              element ? "found" : "not found"
            }`
          );
        }

        return element;
      },

      isDesktopElementRegistered: (item) => {
        const state = get();
        return state.registeredDesktopItems.has(item);
      },

      isMobileElementRegistered: (item) => {
        const state = get();
        return state.registeredMobileItems.has(item);
      },
    }),
    {
      name: "element-registry-state",
    }
  )
);

// Selectors for performance optimization
export const selectDesktopElement =
  (item: string) => (state: ElementRegistryState) =>
    state.getDesktopElement(item);
export const selectMobileElement =
  (item: string) => (state: ElementRegistryState) =>
    state.getMobileElement(item);
export const selectParentElement = (state: ElementRegistryState) =>
  state.parentElement;
export const selectIsDesktopElementRegistered =
  (item: string) => (state: ElementRegistryState) =>
    state.isDesktopElementRegistered(item);
export const selectIsMobileElementRegistered =
  (item: string) => (state: ElementRegistryState) =>
    state.isMobileElementRegistered(item);
