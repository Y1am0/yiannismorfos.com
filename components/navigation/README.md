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
  - Centralized rules used by hover handlers + the pill controller:
    - which items allow hover on mobile viewport
    - which item is *effectively* displayed (hover vs active, with mobile gating)
    - which element registry + position mode to use for the pill (`absolute` vs `fixed`)

### Stores (Zustand)

- `components/navigation/stores/navigationState.ts`
  - Interaction state: `hoveredItem`, `pressedItem`, `activeItem`, `lastClickedItem`
  - Also manages the short hover-exit timeout
- `components/navigation/stores/mobileMenuState.ts`
  - `isOpen`, `isMobile`, `animationsComplete`
- `components/navigation/stores/glassPillState.ts`
  - The computed pill rectangle + visibility + `positionMode`

### DOM registry (Context)

- `components/navigation/NavigationRegistryProvider.tsx`
  - Stores IDs → DOM elements in three contexts:
    - header (`absolute`, top nav)
    - overlay (`fixed`, mobile menu)
    - fixed (`fixed`, footer)
  - Exposes a small API for registration + lookups and a subscription version for controllers.
  - Must wrap the UI that uses navigation interactions (header + footer); see `app/layout.tsx`.

### Pill controller (one place that moves/hides the pill)

- `components/navigation/useGlassPillController.ts`
  - Watches state + registry and calls `glassPillState.updatePosition(...)`
  - Responsible for page-load gating and resize re-sync

## Adding / changing items

### Add a new header + mobile menu item

1. Add it to `components/navigation/navigationConfig.ts` in `MENU_ITEMS` with `type: "navigation"` (or `"blog"`).
2. Done — mobile hover/pill gating uses derived categories.

### Add a new external link icon

1. Add it to `components/navigation/navigationConfig.ts` in `EXTERNAL_LINKS`.
2. Add an icon render case in `components/navigation/ExternalLinks.tsx` if it’s a new icon type.

### Add a new music player button that participates in the pill system

1. Add its ID to `components/navigation/navigationConfig.ts` in `MUSIC_PLAYER_BUTTON_IDS`.
2. Use `useMusicPlayerButton()` in the button component.
