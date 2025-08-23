# `@/components/navigation`

A self-contained, animated navigation system built with **Next.js App Router**, **motion/react** (Framer-Motion v12+), **Zustand**, and **Tailwind CSS**.

Its goals:

1. Provide a silky-smooth, delightfully animated nav bar that scales from mobile to desktop.
2. Keep all state colocated in lightweight stores for testability & isolation.
3. Offer an easy extension surface – new items, new effects, alternate layouts – without touching unrelated code.

---

## 📂 Directory layout

```
components/navigation/
├─ AbsoluteItem.tsx        // Utility wrapper for absolute-positioned children
├─ ExternalLinks.tsx       // Rotating vertical social links (GitHub/LinkedIn & Instagram/TikTok)
├─ GlassPill.tsx           // Shared animated background highlight
├─ Logo.tsx                // SVG/site logo with hover/press behaviour
├─ MenuToggle.tsx          // Mobile hamburger ↔︎ cross toggle
├─ MobileMenu.tsx          // Full-screen modal housing nav items on < 768 px
├─ Navigation.tsx          // Orchestrator – renders everything & wires stores
├─ NavigationItem.tsx      // Single text/SVG nav entry
├─ constants.ts            // Layout, z-index & animation presets
├─ menu-items.ts           // Source-of-truth item list
├─ stores/                 // Zustand state modules (see below)
├─ types.ts                // Shared literal unions + helper types
└─ README.md               // ← you are here
```

### Zustand stores (`./stores`)

| File                      | Responsibility                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| `elementRegistryState.ts` | Maps _item id ➜ DOM element_ for desktop & mobile lists.          |
| `navigationState.ts`      | Transient UI state: hovered/pressed/active item, exit timers.     |
| `mobileMenuState.ts`      | Open/close toggles, _isMobile_ flag & animation-completion latch. |
| `glassPillState.ts`       | Position & visibility of the translucent pill background.         |

`index.ts` re-exports everything and defines two convenience hooks:

- **`useNavigationActions()`** – bundled callbacks (hover start/end, toggle menu, etc.) that coordinate multiple stores.
- **`useNavigationSelectors()`** – memoised selectors for components.

---

## ✨ Feature tour

### 1. Animated “Glass Pill” highlight

- Appears under the currently **hovered**, **focused** or **active** menu item.
- Derived from `glassPillState.backgroundStyle` (width/height + x/y), updated via `updateGlassPillPosition()`.
- Recognises five visual modes:
  1. **Circular** (logo / hamburger / blog icon / external links)
  2. **Rectangular** (text items)
  3. **Fixed** (mobile modal – uses viewport coords)
  4. **Pressed** (scale ↑ on mousedown)
  5. **Reduced-motion** (opacity fade only)
- Motion settings live in `constants.ts → ANIMATION_CONFIG.glassPill`.

### 2. Responsive breakpoints & resize flow

- `<768px` is considered **mobile**. A debounced checker (50 ms) sets `mobileMenuState.isMobile` and auto-closes the modal when switching back to desktop.
- Glass-pill **repositions** on every resize frame via an `requestAnimationFrame` throttle to keep in sync with the paint loop.

### 3. Mobile menu modal

- Full-screen **backdrop-blur** overlay (`Z_INDEX.mobileMenu = 30`).
- Children rendered with a staggered slide-up animation (`motion.div` + delay trail).
- Closing the modal resets the mobile element registry & hides the pill.

### 4. Accessibility

- Keyboard support – `NavigationItem` gains `tabIndex=0` (if not a link) and triggers hover logic on `focus`/`blur`.
- SVG icons have `aria-label` and `role="button"` where appropriate.

### 5. Dev-time utilities

- **Console logs** are gated behind `process.env.NODE_ENV === "development"`.
- Placeholder helpers (`createDevLogger`, `createPerfMonitor`) demonstrate how to subscribe to store changes if deeper debugging is desired.

---

## ⚙️ How it works

1. **Mount phase**
   - `Navigation` sets the **parentRef** for positioning math and registers it via `setParentElement()`.
   - Each interactive component (`Logo`, `NavigationItem`, `MenuToggle`, external links) registers its DOM element in **`elementRegistryState`**.
2. **Interaction phase**
   - Hover/Focus → `handleHoverStart(id, el)` → updates `hoveredItem` + pill position.
   - Mouse down → sets `pressedItem` for subtle scale-up.
   - Mouse leave / blur → `handleHoverEnd()` schedules pill exit (100 ms) via timeout.
3. **Navigation change**
   - On route change (`usePathname`), active item is recalculated → pill snaps to new item.
4. **Resize**
   - rAF-throttled listener re-computes pill target every frame.

---

## ➕ Extending / Modifying

### Add a new navigation entry

1. Edit `menu-items.ts` and append a new `MenuItem` object.
2. If it’s a _brand-new category_ (e.g. `docs`), update `types.ts → NavigationItemId`.
3. Update `constants.ts → NAVIGATION_CATEGORIES` if its behaviour differs (always-visible, etc.).
4. If it has an icon, add it to `Navigation` render tree using `<NavigationItem itemId="docs" href="/docs">…</NavigationItem>`.

### Change animation behaviour

- Tweak or add a preset in `SPRING_PRESETS` then reference it from `ANIMATION_CONFIG`.
- For one-off variants pass `transition` props directly to `<motion.div>`.

### Alter breakpoints

- Update hard-coded `768` in `Navigation.tsx → checkMobile()`.

### Listen to state for another feature

- Import the relevant Zustand store and subscribe with a selector:
  ```ts
  const active = useNavigationState((s) => s.activeItem);
  ```

### Type Safety

The navigation system is fully type-safe with TypeScript:

- `NavigationItemId` type in `types.ts` defines all valid navigation item IDs
- `ExternalLinkId` type defines the subset of IDs valid for social links
- State management uses these types to ensure type safety across component boundaries
- `NAVIGATION_CATEGORIES` in `constants.ts` provides runtime grouping of these typed IDs

---

## 🗂️ Glossary of Item IDs

| ID                                             | Type       | Notes                                |
| ---------------------------------------------- | ---------- | ------------------------------------ |
| `logo`                                         | logo       | Home page link, always shown         |
| `menu`                                         | control    | Mobile hamburger / close icon        |
| `hello` / `who` / `what` / `connect`           | navigation | Middle text links                    |
| `blog`                                         | blog       | Renders as a `Quote` icon on desktop |
| `github` / `linkedin` / `instagram` / `tiktok` | external   | Rotating vertical social bar         |

These strings are centralised in `types.ts → NavigationItemId` so refactor tools will catch rename errors.

---

## 🔋 Dependencies

- **Next.js 15** (App Router) – Client components only.
- **motion/react 12** – successor to Framer-Motion.
- **Zustand 5** – global stores.
- **Tailwind CSS 4** – Utility classes.

---

### Author’s note

This README is kept inside the module to stay co-located with the code it documents. If you spot missing details or decide to refactor significant logic, please update this file accordingly – future you (and other contributors) will thank you! 🎉
