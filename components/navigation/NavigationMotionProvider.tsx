"use client";

import { LayoutGroup } from "motion/react";

export const NavigationMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <LayoutGroup id="navigation-glass-pill">{children}</LayoutGroup>;
};

