"use client";

import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
} from "@/components/icons";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ANIMATION_CONFIG,
  EXTERNAL_LINK_ROTATION_INTERVAL,
  LAYOUT_CONSTANTS,
} from "./constants";
import { getExternalLinks } from "./menu-items";
import { useNavigationActions } from "./stores";

import { ExternalLinkId } from "./types";

import { NavigationItemId } from "./types";

interface ExternalLinkItemProps {
  id: NavigationItemId;
  href: string;
  iconType: ExternalLinkId;
  label: string;
}

const ExternalLinkItem = ({
  id,
  href,
  iconType,
  label,
  onHoverChange,
}: ExternalLinkItemProps & { onHoverChange?: (hovered: boolean) => void }) => {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    handleElementMount,
  } = useNavigationActions();

  // Register element on mount
  useEffect(() => {
    if (itemRef.current) {
      handleElementMount(id, itemRef.current);
    }
  }, [id, handleElementMount]);

  // Memoized hover start handler
  const handleHoverStartCallback = useCallback(() => {
    if (itemRef.current) {
      handleHoverStart(id, itemRef.current);
    }
    onHoverChange?.(true);
  }, [handleHoverStart, id, onHoverChange]);

  // Memoized hover end handler
  const handleHoverEndCallback = useCallback(() => {
    handleHoverEnd();
    onHoverChange?.(false);
  }, [handleHoverEnd, onHoverChange]);

  // Memoized mouse down handler
  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown(id);
  }, [handleMouseDown, id]);

  const renderIcon = () => {
    switch (iconType) {
      case "github":
        return (
          <GitHubIcon size={20} className="text-white/70 transition-colors" />
        );
      case "linkedin":
        return (
          <LinkedInIcon size={20} className="text-white/70 transition-colors" />
        );
      case "instagram":
        return (
          <InstagramIcon
            size={20}
            className="text-white/70 transition-colors"
          />
        );
      case "tiktok":
        return (
          <TikTokIcon size={20} className="text-white/70 transition-colors" />
        );
      default:
        return null;
    }
  };

  return (
    <motion.a
      ref={itemRef}
      {...ANIMATION_CONFIG.externalLink}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LAYOUT_CONSTANTS.itemPadding} cursor-pointer select-none block`}
      onMouseEnter={handleHoverStartCallback}
      onMouseLeave={handleHoverEndCallback}
      onTouchStart={handleHoverStartCallback}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      aria-label={label}
    >
      {renderIcon()}
    </motion.a>
  );
};

const ExternalLinksComponent = () => {
  const allLinks = getExternalLinks();
  // Define rotating sets by id order
  const linkSets = useMemo(
    () => [
      ["github", "linkedin"] as [ExternalLinkId, ExternalLinkId],
      ["instagram", "tiktok"] as [ExternalLinkId, ExternalLinkId],
    ],
    []
  );
  const [setIndex, setSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle through sets on interval, pause if hovered
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setSetIndex((prev) => (prev + 1) % linkSets.length);
    }, EXTERNAL_LINK_ROTATION_INTERVAL);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, linkSets.length]);

  // Pause timer on hover
  const handleHoverChange = useCallback((hovered: boolean) => {
    setIsPaused(hovered);
  }, []);

  const visibleLinks = allLinks.filter((l) =>
    linkSets[setIndex].includes(l.id as ExternalLinkId)
  );

  return (
    <div className="absolute right-4 bottom-8 lg:right-12 z-20 flex flex-col items-center space-y-2">
      {/* Animated vertical line - animates in sync with links */}
      <div className="relative h-26">
        {" "}
        {/* Fixed container height */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`line-${setIndex}`}
            className="w-px h-24 bg-white/70 absolute top-0 left-1/2 -translate-x-1/2 origin-top"
            initial={{ scaleY: 1 }}
            animate={{
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.8,
              times: [0, 0.5, 1], // Extend during first half, retract during second half
              ease: "easeInOut",
            }}
          />
        </AnimatePresence>
      </div>
      {/* External links with fixed height to prevent line movement */}
      <div className="flex flex-col h-[92px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={setIndex}
            className="flex flex-col space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, staggerChildren: 0.1 }}
          >
            {visibleLinks.map((link) => (
              <ExternalLinkItem
                key={link.id}
                id={link.id}
                href={link.href}
                iconType={link.iconType}
                label={link.label}
                onHoverChange={handleHoverChange}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ExternalLinks = memo(ExternalLinksComponent);

// Add display name for debugging
ExternalLinks.displayName = "ExternalLinks";
