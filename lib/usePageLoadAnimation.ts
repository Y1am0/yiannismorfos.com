"use client";

import { useEffect, useState } from "react";

export const usePageLoadAnimation = () => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(false);
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
  const [isExternalLinksVisible, setIsExternalLinksVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationVisible(true);
      setIsMusicPlayerVisible(true);
      setIsExternalLinksVisible(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return {
    isNavigationVisible,
    isMusicPlayerVisible,
    isExternalLinksVisible,
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
