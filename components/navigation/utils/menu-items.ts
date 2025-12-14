import type { MenuItem } from "../config/navigationConfig";
import { EXTERNAL_LINKS, MENU_ITEMS } from "../config/navigationConfig";

type NavigationMenuItem = Extract<MenuItem, { type: "navigation" }>;
type LogoMenuItem = Extract<MenuItem, { type: "logo" }>;
type BlogMenuItem = Extract<MenuItem, { type: "blog" }>;

const isNavigationItem = (item: MenuItem): item is NavigationMenuItem =>
  item.type === "navigation";
const isLogoItem = (item: MenuItem): item is LogoMenuItem =>
  item.type === "logo";
const isBlogItem = (item: MenuItem): item is BlogMenuItem =>
  item.type === "blog";

// Helper functions to get specific menu items
export const getNavigationItems = (): readonly NavigationMenuItem[] =>
  MENU_ITEMS.filter(isNavigationItem);
export const getLogoItem = (): LogoMenuItem | null =>
  MENU_ITEMS.find(isLogoItem) ?? null;
export const getBlogItem = (): BlogMenuItem | null =>
  MENU_ITEMS.find(isBlogItem) ?? null;
export const getExternalLinks = () => EXTERNAL_LINKS;
