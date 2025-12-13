"use client";

import { useCallback, useEffect, useLayoutEffect } from "react";
import {
  getEffectiveDisplayedItem,
  resolvePillTarget,
  shouldHidePillForPageLoad,
} from "./navigationPolicy";
import {
  useNavigationRegistry,
  useNavigationRegistryVersion,
} from "./NavigationRegistryProvider";
import { useGlassPillState } from "./stores/glassPillState";
import { useMobileMenuState } from "./stores/mobileMenuState";
import { useNavigationState } from "./stores/navigationState";

export const useGlassPillController = (pageLoadComplete: boolean) => {
  const hoveredItem = useNavigationState((s) => s.hoveredItem);
  const activeItem = useNavigationState((s) => s.activeItem);

  const isMobileViewport = useMobileMenuState((s) => s.isMobile);
  const isMobileMenuOpen = useMobileMenuState((s) => s.isOpen);
  const mobileMenuAnimationsComplete = useMobileMenuState(
    (s) => s.animationsComplete
  );

  const registry = useNavigationRegistry();
  const registryVersion = useNavigationRegistryVersion();

  const updatePosition = useGlassPillState((s) => s.updatePosition);
  const setIsVisible = useGlassPillState((s) => s.setIsVisible);
  const glassPillVisible = useGlassPillState((s) => s.isVisible);

  const sync = useCallback(() => {
    const viewport = {
      isMobileViewport,
      isMobileMenuOpen,
      mobileMenuAnimationsComplete,
    };

    const displayedItem = getEffectiveDisplayedItem(
      hoveredItem,
      activeItem,
      viewport
    );

    if (
      shouldHidePillForPageLoad(displayedItem, hoveredItem, {
        pageLoadComplete,
      })
    ) {
      setIsVisible(false);
      return;
    }

    if (!displayedItem) {
      setIsVisible(false);
      return;
    }

    const target = resolvePillTarget(displayedItem, viewport, {
      parentElement: registry.getParentElement(),
      getHeaderElement: registry.getHeaderElement,
      getOverlayElement: registry.getOverlayElement,
      getFixedElement: registry.getFixedElement,
    });

    if (!target.element || !target.mode) {
      setIsVisible(false);
      return;
    }

    updatePosition(target.element, target.parentElement, target.mode);
  }, [
    activeItem,
    hoveredItem,
    isMobileMenuOpen,
    isMobileViewport,
    mobileMenuAnimationsComplete,
    pageLoadComplete,
    registry,
    setIsVisible,
    updatePosition,
  ]);

  // Sync after layout changes (hover/active/menu state, and registry mounts/unmounts).
  useLayoutEffect(() => {
    sync();
  }, [sync, registryVersion]);

  // Re-sync on viewport resizes (rAF-throttled).
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId: number | null = null;
    const onResize = () => {
      if (!glassPillVisible) return;
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        sync();
        frameId = null;
      });
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
    };
  }, [glassPillVisible, sync]);
};
