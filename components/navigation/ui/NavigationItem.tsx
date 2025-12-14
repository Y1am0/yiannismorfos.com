"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import { memo, useCallback } from "react";
import { ANIMATION_CONFIG, LAYOUT_CONSTANTS } from "../config/constants";
import { useIsCoarsePointer } from "../hooks/useIsCoarsePointer";
import { useNavigationPill } from "../hooks/useNavigationPill";
import type { NavigationItemId } from "../config/navigationConfig";
import { useNavigationActions } from "../stores";
import { GlassPill } from "./GlassPill";

type BaseProps = {
  children: React.ReactNode;
  itemId: NavigationItemId;
  href?: string;
  onClick?: () => void;
  className?: string;
  renderPill?: React.ReactNode;
};

const BaseNavigationItem = ({
  children,
  itemId,
  href,
  onClick,
  className,
  enableHover,
  renderPill,
}: BaseProps & { enableHover: boolean }) => {
  const startExit = useRouteTransitionStore((s) => s.startExit);
  const {
    handleHoverStart,
    handleHoverEnd,
    handleMouseDown,
    handleMouseUp,
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
      className={`text-2xl font-thin ${
        LAYOUT_CONSTANTS.itemPadding
      } cursor-pointer relative focus-visible:outline-none ${className ?? ""}`}
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

type HeaderNavigationItemProps = Omit<BaseProps, "renderPill"> & {
  mode?: "header";
};

type MobileMenuNavigationItemProps = BaseProps & {
  mode: "mobileMenu";
};

type Props = HeaderNavigationItemProps | MobileMenuNavigationItemProps;

const HeaderNavigationItem = (props: HeaderNavigationItemProps) => {
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

const MobileMenuNavigationItem = (props: MobileMenuNavigationItemProps) => {
  return <BaseNavigationItem {...props} enableHover={false} />;
};

const NavigationItemComponent = (props: Props) => {
  return props.mode === "mobileMenu" ? (
    <MobileMenuNavigationItem {...props} />
  ) : (
    <HeaderNavigationItem {...props} />
  );
};

export const NavigationItem = memo(NavigationItemComponent);
NavigationItem.displayName = "NavigationItem";
