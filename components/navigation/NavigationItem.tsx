"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import { memo, useCallback } from "react";
import { ANIMATION_CONFIG, LAYOUT_CONSTANTS } from "./constants";
import { GlassPill } from "./GlassPill";
import { useIsCoarsePointer } from "./useIsCoarsePointer";
import { useNavigationActions } from "./stores";
import type { NavigationItemId } from "./types";
import { useNavigationPill } from "./useNavigationPill";

type BaseProps = {
  children: React.ReactNode;
  itemId: NavigationItemId;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const BaseNavigationItem = ({
  children,
  itemId,
  href,
  onClick,
  className,
  enableHover,
  renderPill,
}: BaseProps & {
  enableHover: boolean;
  renderPill?: React.ReactNode;
}) => {
  const startExit = useRouteTransitionStore((s) => s.startExit);
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
    closeMenu,
    setActiveItem,
    setLastClickedItem,
  } = useNavigationActions();

  const handleHoverStartCallback = useCallback(() => {
    handleHoverStart(itemId);
  }, [handleHoverStart, itemId]);

  const handleMouseDownCallback = useCallback(() => {
    handleMouseDown(itemId);
  }, [handleMouseDown, itemId]);

  const handleClickCallback = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const content = (
    <motion.div
      data-nav-item-id={itemId}
      className={`text-2xl font-thin ${LAYOUT_CONSTANTS.itemPadding} cursor-pointer relative focus-visible:outline-none ${className ?? ""}`}
      onHoverStart={enableHover ? handleHoverStartCallback : undefined}
      onHoverEnd={enableHover ? handleHoverEnd : undefined}
      onTouchStart={enableHover ? handleHoverStartCallback : undefined}
      onMouseDown={handleMouseDownCallback}
      onMouseUp={handleMouseUp}
      onClick={href ? undefined : handleClickCallback}
      onFocus={enableHover ? handleHoverStartCallback : undefined}
      onBlur={enableHover ? handleHoverEnd : undefined}
      {...ANIMATION_CONFIG.navigationItem}
      tabIndex={href ? undefined : 0}
    >
      {renderPill}
      {children}
    </motion.div>
  );

  return href ? (
    <DelayedLink
      href={href}
      delay={300}
      onClick={() => {
        onClick?.();
        closeMenu();
      }}
      beforeNavigate={() => {
        startExit();
        setActiveItem(itemId);
        setLastClickedItem(itemId);
      }}
    >
      {content}
    </DelayedLink>
  ) : (
    content
  );
};

const DesktopNavigationItemComponent = (props: BaseProps) => {
  const isCoarsePointer = useIsCoarsePointer();
  const { clearExitingItem } = useNavigationActions();

  const pill = useNavigationPill(props.itemId, "header");
  const renderPill = pill.shouldRender ? (
    <GlassPill
      variant={pill.variant}
      circleSizePx={pill.circleSizePx}
      isPressed={pill.isPressed}
      isExiting={pill.isExiting}
      onExitComplete={clearExitingItem}
    />
  ) : null;

  return (
    <BaseNavigationItem
      {...props}
      enableHover={!isCoarsePointer}
      renderPill={renderPill}
    />
  );
};

export const NavigationItem = memo(DesktopNavigationItemComponent);
NavigationItem.displayName = "NavigationItem";

const MobileNavigationItemComponent = (props: BaseProps) => {
  const isCoarsePointer = useIsCoarsePointer();
  return <BaseNavigationItem {...props} enableHover={!isCoarsePointer} />;
};

export const MobileNavigationItem = memo(MobileNavigationItemComponent);
MobileNavigationItem.displayName = "MobileNavigationItem";
