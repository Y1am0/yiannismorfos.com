import {
  EXTERNAL_LINKS,
  MENU_ITEMS,
  MUSIC_PLAYER_BUTTON_IDS,
} from "./navigationConfig";
import type {
  ExternalLinkId,
  MenuItem,
  NavigationItemId,
  MusicPlayerButtonId,
} from "./types";

type NavigationMenuItem = Extract<MenuItem, { type: "navigation" }>;
type BlogMenuItem = Extract<MenuItem, { type: "blog" }>;

const isNavigationMenuItem = (item: MenuItem): item is NavigationMenuItem =>
  item.type === "navigation";
const isBlogMenuItem = (item: MenuItem): item is BlogMenuItem =>
  item.type === "blog";

const NAVIGATION_ITEM_IDS: NavigationItemId[] = MENU_ITEMS.filter(
  isNavigationMenuItem
).map((item) => item.id);

const BLOG_ITEM_IDS: NavigationItemId[] = MENU_ITEMS.filter(isBlogMenuItem).map(
  (item) => item.id
);

const EXTERNAL_LINK_IDS: ExternalLinkId[] = EXTERNAL_LINKS.map(
  (link) => link.id
);

const MUSIC_PLAYER_BUTTON_ID_LIST: MusicPlayerButtonId[] = [
  ...MUSIC_PLAYER_BUTTON_IDS,
];

// Navigation item categories for interaction/pill logic.
export const NAVIGATION_CATEGORIES: {
  alwaysVisible: ReadonlyArray<NavigationItemId>;
  externalLinks: ReadonlyArray<ExternalLinkId>;
  navigationItems: ReadonlyArray<NavigationItemId>;
  blogItem: ReadonlyArray<NavigationItemId>;
  musicPlayerButtons: ReadonlyArray<MusicPlayerButtonId>;
} = {
  alwaysVisible: ["logo", "menu"],
  externalLinks: EXTERNAL_LINK_IDS,
  navigationItems: NAVIGATION_ITEM_IDS,
  blogItem: BLOG_ITEM_IDS,
  musicPlayerButtons: MUSIC_PLAYER_BUTTON_ID_LIST,
} as const;
