# Navigation System

This folder implements the site navigation + the “glass pill” highlight that follows hover/active/press across:

- Header navigation (desktop + mobile)
- Mobile menu overlay
- Footer external links
- Music player buttons

The goal is to keep **IDs + data** centralized, and keep **interaction rules** explicit and shared (so adding a new menu item doesn’t require updating multiple files).

## Files that matter

### Data + IDs (single source of truth)

- `components/navigation/navigationConfig.ts`
  - Defines `MENU_ITEMS`, `EXTERNAL_LINKS`, `MUSIC_PLAYER_BUTTON_IDS`, `NAVIGATION_CONTROL_IDS`
  - Derives the literal-union types (`NavigationItemId`, `ExternalLinkId`, …) from the data above

### Helpers

- `components/navigation/menu-items.ts`
  - Thin typed helpers like `getNavigationItems()`, `getBlogItem()`, `getExternalLinks()`

### Interaction model (derived categories)

- `components/navigation/navigationModel.ts`
  - Defines `NAVIGATION_CATEGORIES`
  - `navigationItems` / `blogItem` / `externalLinks` are derived from config to avoid drift

### Interaction policy (the rules)

- `components/navigation/navigationPolicy.ts`
  - Centralized rules used by hover handlers and pill rendering:
    - which items allow hover on mobile viewport
    - type guards/helpers for ID categories (external links, music buttons, nav/blog)

### Stores (Zustand)

- `components/navigation/stores/navigationState.ts`
  - Interaction state: `hoveredItem`, `pressedItem`, `activeItem`, `lastClickedItem`
  - Also manages the short hover-exit timeout
- `components/navigation/stores/mobileMenuState.ts`
  - `isOpen`, `isMobile`, `animationsComplete`
  - `animationsComplete` is set by `MobileMenu` when the stagger finishes

### Glass pill (declarative)

On desktop header + footer, the glass pill is rendered **inside the currently displayed item** using Motion shared layout (`layoutId`), so there is:

- no DOM element registry
- no rectangle measurement logic
- no “controller” effect that repositions a global overlay

### Mobile menu overlay (buttery smooth + stable color)

The mobile menu overlay is a special case:

- We render a single fixed overlay pill (`components/navigation/MobileMenuPill.tsx`) and animate its `x/y/width/height` to match the hovered item.
- Mobile menu items render via `MobileNavigationItem` (no per-item shared-layout pill in the overlay).
- The overlay pill uses `GLASS_EFFECT_STYLES_OVERLAY` (same look, but **no `backdrop-filter`**) to prevent color flicker during movement.
- `mobileMenuState.animationsComplete` is driven by **real Motion animation completion** (no hardcoded timeouts).

The shared-layout boundary is provided by `components/navigation/NavigationMotionProvider.tsx` (wired in `app/layout.tsx`).
Page-load gating is provided by `components/PageLoadAnimationProvider.tsx` (also wired in `app/layout.tsx`).

## Adding / changing items

### Add a new header + mobile menu item

1. Add it to `components/navigation/navigationConfig.ts` in `MENU_ITEMS` with `type: "navigation"` (or `"blog"`).
2. Done — mobile hover/pill gating uses derived categories.

### Add a new external link icon

1. Add it to `components/navigation/navigationConfig.ts` in `EXTERNAL_LINKS`.
2. Add an icon render case in `components/navigation/ExternalLinks.tsx` if it’s a new icon type.

### Add a new music player button that participates in the pill system

1. Add its ID to `components/navigation/navigationConfig.ts` in `MUSIC_PLAYER_BUTTON_IDS`.
2. Wire hover/press via `useMusicPlayerButton()` and render the pill via `useNavigationPill()` (see `components/MusicPlayer/components/ControlButtons.tsx`).
