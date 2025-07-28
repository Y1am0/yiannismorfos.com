"use client";

import { useEffect, useState } from "react";

// Global flag to track if initial page load animation has occurred
let hasInitialAnimationPlayed = false;

/**
 * Hook to manage page load animation states with staggered timing
 * Returns boolean states for each component to control their entrance animations
 * Only plays the animation once per session (not on route changes)
 */
export const usePageLoadAnimation = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(
    hasInitialAnimationPlayed
  );
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(
    hasInitialAnimationPlayed
  );
  const [isExternalLinksVisible, setIsExternalLinksVisible] = useState(
    hasInitialAnimationPlayed
  );
  const [animationsComplete, setAnimationsComplete] = useState(
    hasInitialAnimationPlayed
  );

  useEffect(() => {
    // If animation has already played, show components immediately
    if (hasInitialAnimationPlayed) {
      setIsNavigationVisible(true);
      setIsMusicPlayerVisible(true);
      setIsExternalLinksVisible(true);
      setAnimationsComplete(true);
      return;
    }

    // Play initial animation only once
    const timer = setTimeout(() => {
      setIsNavigationVisible(true);
      setIsMusicPlayerVisible(true);
      setIsExternalLinksVisible(true);

      // Mark as played after a small delay to ensure animation has started
      setTimeout(() => {
        hasInitialAnimationPlayed = true;
      }, 100);

      // Mark animations as complete after the longest animation duration (navigation: 0.6s)
      setTimeout(() => {
        setAnimationsComplete(true);
      }, 600);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return {
    isNavigationVisible,
    isMusicPlayerVisible,
    isExternalLinksVisible,
    shouldAnimate: !hasInitialAnimationPlayed, // Only animate on first load
    animationsComplete, // Indicates when all animations have finished
  };
};

// Animation configurations for each component
export const PAGE_LOAD_ANIMATIONS = {
  navigation: {
    initial: { opacity: 0, y: -30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  musicPlayer: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  externalLinks: {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
} as const;
