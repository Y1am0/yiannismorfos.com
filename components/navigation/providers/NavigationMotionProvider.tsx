"use client";

import { LayoutGroup } from "motion/react";
import { PillPresenceProvider } from "./PillPresenceProvider";
import { NavigationViewportProvider } from "./NavigationViewportProvider";

export const NavigationMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <NavigationViewportProvider>
      <PillPresenceProvider>
        <LayoutGroup id="navigation-glass-pill">{children}</LayoutGroup>
      </PillPresenceProvider>
    </NavigationViewportProvider>
  );
};
