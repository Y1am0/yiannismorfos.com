"use client";

import { LAYOUT_CONSTANTS } from "./constants";

interface AbsoluteItemProps {
  position: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export const AbsoluteItem = ({
  position,
  children,
  className = "",
}: AbsoluteItemProps) => {
  const positionClasses =
    position === "left"
      ? LAYOUT_CONSTANTS.responsiveDesktopPadding
      : LAYOUT_CONSTANTS.responsiveMobilePadding;

  return (
    <div
      className={`${LAYOUT_CONSTANTS.absolutePositioning} ${positionClasses} ${className}`}
    >
      {children}
    </div>
  );
};
