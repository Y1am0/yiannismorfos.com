"use client";

import { LayoutGroup } from "motion/react";
import { PillPresenceProvider } from "./PillPresenceProvider";

export const NavigationMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PillPresenceProvider>
      <LayoutGroup id="navigation-glass-pill">{children}</LayoutGroup>
    </PillPresenceProvider>
  );
};
