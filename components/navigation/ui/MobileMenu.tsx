"use client";

import { Z_INDEX } from "@/components/navigation/config/constants";
import {
  useNavigationActions,
  useNavigationSelectors,
} from "@/components/navigation/stores";
import { useMobileMenuState } from "@/components/navigation/stores/mobileMenuState";
import { MobileMenuPill } from "@/components/navigation/ui/MobileMenuPill";
import { MobileNavigationItem } from "@/components/navigation/ui/NavigationItem";
import {
  getBlogItem,
  getNavigationItems,
} from "@/components/navigation/utils/menu-items";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useMemo, useRef } from "react";

const MobileMenuComponent = () => {
  const { isMobileMenuOpen } = useNavigationSelectors();
  const { closeMenu, clearExitingItem } = useNavigationActions();
  const mobileMenuAnimationsComplete = useMobileMenuState(
    (s) => s.animationsComplete
  );
  const setAnimationsComplete = useMobileMenuState(
    (s) => s.setAnimationsComplete
  );

  // Memoized menu items to prevent recreation on each render
  const menuItems = useMemo(() => {
    const navigationItems = getNavigationItems();
    const blogItem = getBlogItem();
    return [...navigationItems, ...(blogItem ? [blogItem] : [])];
  }, []);
  const contentRef = useRef<HTMLDivElement>(null);

  // Memoized backdrop click handler
  const handleBackdropClick = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  // Memoized content click handler to prevent event bubbling
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          style={{ zIndex: Z_INDEX.mobileMenu }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <MobileMenuPill
            containerRef={contentRef}
            isOpen={isMobileMenuOpen}
            animationsComplete={mobileMenuAnimationsComplete}
            onExitComplete={clearExitingItem}
          />
          <motion.div
            ref={contentRef}
            className="text-white flex flex-col items-center space-y-4 relative z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            onClick={handleContentClick}
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                }}
                onAnimationComplete={() => {
                  const isLast = index === menuItems.length - 1;
                  if (!isLast) return;
                  if (!useMobileMenuState.getState().isOpen) return;
                  setAnimationsComplete(true);
                }}
              >
                <MobileNavigationItem
                  itemId={item.id}
                  href={item.href}
                  onClick={closeMenu}
                >
                  <span className="text-4xl font-thin text-center">
                    {item.label}
                  </span>
                </MobileNavigationItem>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MobileMenu = memo(MobileMenuComponent);

// Add display name for debugging
MobileMenu.displayName = "MobileMenu";
