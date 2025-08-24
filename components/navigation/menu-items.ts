import { ExternalLinkId, NavigationItemId } from "./types";

export interface MenuItem {
  id: NavigationItemId;
  label: string;
  href: string;
  type: "logo" | "navigation" | "blog" | "external";
}

export interface ExternalLink {
  id: NavigationItemId;
  label: string;
  href: string;
  iconType: ExternalLinkId;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "logo",
    label: "Home",
    href: "/",
    type: "logo",
  },
  {
    id: "hello",
    label: "hello",
    href: "/hello",
    type: "navigation",
  },
  {
    id: "who",
    label: "who",
    href: "/who",
    type: "navigation",
  },
  {
    id: "what",
    label: "what",
    href: "/what?tab=dev",
    type: "navigation",
  },
  {
    id: "connect",
    label: "connect",
    href: "/connect",
    type: "navigation",
  },
  {
    id: "blog",
    label: "blog",
    href: "/blog",
    type: "blog",
  },
];

// External links for social/professional platforms
export const EXTERNAL_LINKS: ExternalLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/y1am0",
    iconType: "github",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/yiannismorfos",
    iconType: "linkedin",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/yiannismorfos",
    iconType: "instagram",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://tiktok.com/@yiannismorfos",
    iconType: "tiktok",
  },
];

// Helper functions to get specific menu items
export const getNavigationItems = () =>
  MENU_ITEMS.filter((item) => item.type === "navigation");
export const getLogoItem = () =>
  MENU_ITEMS.find((item) => item.type === "logo");
export const getBlogItem = () =>
  MENU_ITEMS.find((item) => item.type === "blog");
export const getExternalLinks = () => EXTERNAL_LINKS;
