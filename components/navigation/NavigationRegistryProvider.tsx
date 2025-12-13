"use client";

import type { NavigationItemId } from "./types";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

type Listener = () => void;

type NavigationRegistry = {
  // Write API
  setParentElement: (el: Element | null) => void;
  registerHeaderElement: (id: NavigationItemId, el: Element) => void;
  registerOverlayElement: (id: NavigationItemId, el: Element) => void;
  registerFixedElement: (id: NavigationItemId, el: Element) => void;
  clearOverlayElements: () => void;
  clearAll: () => void;

  // Read API
  getParentElement: () => Element | null;
  getHeaderElement: (id: NavigationItemId) => Element | null;
  getOverlayElement: (id: NavigationItemId) => Element | null;
  getFixedElement: (id: NavigationItemId) => Element | null;

  // Change subscription (for controller hooks)
  subscribe: (listener: Listener) => () => void;
  getVersion: () => number;
};

const NavigationRegistryContext = createContext<NavigationRegistry | null>(null);

export const NavigationRegistryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const headerElementsRef = useRef<Map<NavigationItemId, Element>>(
    new Map<NavigationItemId, Element>()
  );
  const overlayElementsRef = useRef<Map<NavigationItemId, Element>>(
    new Map<NavigationItemId, Element>()
  );
  const fixedElementsRef = useRef<Map<NavigationItemId, Element>>(
    new Map<NavigationItemId, Element>()
  );
  const parentElementRef = useRef<Element | null>(null);

  const listenersRef = useRef(new Set<Listener>());
  const versionRef = useRef(0);

  const notify = () => {
    versionRef.current += 1;
    for (const listener of listenersRef.current) listener();
  };

  const registry = useMemo<NavigationRegistry>(() => {
    const setParentElement = (el: Element | null) => {
      parentElementRef.current = el;
      notify();
    };

    const registerHeaderElement = (id: NavigationItemId, el: Element) => {
      headerElementsRef.current.set(id, el);
      notify();
    };

    const registerOverlayElement = (id: NavigationItemId, el: Element) => {
      overlayElementsRef.current.set(id, el);
      notify();
    };

    const registerFixedElement = (id: NavigationItemId, el: Element) => {
      fixedElementsRef.current.set(id, el);
      notify();
    };

    const clearOverlayElements = () => {
      overlayElementsRef.current = new Map<NavigationItemId, Element>();
      notify();
    };

    const clearAll = () => {
      headerElementsRef.current = new Map<NavigationItemId, Element>();
      overlayElementsRef.current = new Map<NavigationItemId, Element>();
      fixedElementsRef.current = new Map<NavigationItemId, Element>();
      parentElementRef.current = null;
      notify();
    };

    const getParentElement = () => parentElementRef.current;
    const getHeaderElement = (id: NavigationItemId) =>
      headerElementsRef.current.get(id) ?? null;
    const getOverlayElement = (id: NavigationItemId) =>
      overlayElementsRef.current.get(id) ?? null;
    const getFixedElement = (id: NavigationItemId) =>
      fixedElementsRef.current.get(id) ?? null;

    const subscribe = (listener: Listener) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    };

    const getVersion = () => versionRef.current;

    return {
      setParentElement,
      registerHeaderElement,
      registerOverlayElement,
      registerFixedElement,
      clearOverlayElements,
      clearAll,
      getParentElement,
      getHeaderElement,
      getOverlayElement,
      getFixedElement,
      subscribe,
      getVersion,
    };
  }, []);

  return (
    <NavigationRegistryContext.Provider value={registry}>
      {children}
    </NavigationRegistryContext.Provider>
  );
};

export const useNavigationRegistry = () => {
  const ctx = useContext(NavigationRegistryContext);
  if (!ctx) {
    throw new Error(
      "useNavigationRegistry must be used within <NavigationRegistryProvider>"
    );
  }
  return ctx;
};

export const useNavigationRegistryVersion = () => {
  const registry = useNavigationRegistry();
  return useSyncExternalStore(
    registry.subscribe,
    registry.getVersion,
    registry.getVersion
  );
};
