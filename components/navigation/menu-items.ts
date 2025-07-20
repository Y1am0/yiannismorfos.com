export interface MenuItem {
  id: string;
  label: string;
  href: string;
  type: "logo" | "navigation" | "blog";
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
    href: "/what",
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

// Helper functions to get specific menu items
export const getNavigationItems = () =>
  MENU_ITEMS.filter((item) => item.type === "navigation");
export const getLogoItem = () =>
  MENU_ITEMS.find((item) => item.type === "logo");
export const getBlogItem = () =>
  MENU_ITEMS.find((item) => item.type === "blog");
