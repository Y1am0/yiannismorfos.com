/**
 * Navigation system configuration + canonical ID/type definitions.
 *
 * Keep this file boring:
 * - Define the data (menu items, external links, music button IDs)
 * - Derive the literal union ID types from that data
 *
 * Interaction rules live close to the UI/hook code (e.g. `useNavigationPill.ts`).
 */

// ---------------------------------------------
// Menu items (header + mobile menu)
// ---------------------------------------------

export const MENU_ITEMS = [
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
] as const;

export type MenuItem = (typeof MENU_ITEMS)[number];
export type MenuItemId = MenuItem["id"];
export type MenuItemType = MenuItem["type"];

// ---------------------------------------------
// External links (footer)
// ---------------------------------------------

export const EXTERNAL_LINKS = [
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
] as const;

export type ExternalLink = (typeof EXTERNAL_LINKS)[number];
export type ExternalLinkId = ExternalLink["id"];

// ---------------------------------------------
// Music player buttons (footer)
// ---------------------------------------------

export const MUSIC_PLAYER_BUTTON_IDS = [
  "music-play-pause",
  "music-restart",
  "music-volume",
] as const;

export type MusicPlayerButtonId = (typeof MUSIC_PLAYER_BUTTON_IDS)[number];

// ---------------------------------------------
// Non-route UI controls (header)
// ---------------------------------------------

export const NAVIGATION_CONTROL_IDS = ["menu"] as const;
export type NavigationControlId = (typeof NAVIGATION_CONTROL_IDS)[number];

// ---------------------------------------------
// Shared IDs / styles
// ---------------------------------------------

export type NavigationItemId =
  | MenuItemId
  | ExternalLinkId
  | MusicPlayerButtonId
  | NavigationControlId;
