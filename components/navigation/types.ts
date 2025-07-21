// Shared state and utility interfaces
export interface BackgroundStyle {
  width: number;
  left: number;
  height: number;
  top: number;
}

// Unique identifiers for every interactive navigation item
export type NavigationItemId =
  | "logo"
  | "menu"
  | "hello"
  | "who"
  | "what"
  | "connect"
  | "blog"
  | "github"
  | "linkedin"
  | "instagram"
  | "tiktok";

// Utility literal union for external links
export type ExternalLinkId = "github" | "linkedin" | "instagram" | "tiktok";

// Re-export MenuItem from menu-items for convenience
export type { MenuItem } from "./menu-items";
