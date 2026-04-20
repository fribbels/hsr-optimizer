# Changelog Modal Design

**Date:** 2026-04-19  
**Status:** Approved  
**Purpose:** Replace the version update toast notification with a modal that displays changelog content and drives traffic to Discord/GitHub.

## Overview

When `CURRENT_OPTIMIZER_VERSION` increments (~monthly), display a modal showing the latest changelog entry with community CTAs. The modal supports multiple CTA layout variants for A/B testing via a local debug panel.

## Trigger & Flow

1. App loads → `useGlobalStore.getState().version` contains last-seen version
2. After 5s delay → compare against `CURRENT_OPTIMIZER_VERSION`
3. Version mismatch → open `CHANGELOG_MODAL`
4. User dismisses (click outside, Escape, or "Got it" button) → update store version + `SaveState.delayedSave()`
5. Next load → versions match, no modal

## Modal Structure

```
┌─────────────────────────────────────────────┐
│  Update 2026-04-19                      [X] │
├─────────────────────────────────────────────┤
│                                             │
│  • Changelog item 1                         │
│  [screenshot.webp]                          │
│  • Changelog item 2                         │
│  ...                                        │
│                                  (scrolls)  │
├─────────────────────────────────────────────┤
│  <CtaSection variant={activeVariant} />     │
├─────────────────────────────────────────────┤
│                              [ Got it ]     │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Header shows date only (e.g., "Update 2026-04-19")
- Content shows only the most recent changelog entry
- Full images displayed inline with scrolling
- Easy dismissal — clicking outside or Escape closes and saves version

## CTA Variants

Six variants in `src/lib/overlays/modals/changelogCta/`:

| Variant | File | Description |
|---------|------|-------------|
| Subtle | `CtaSubtle.tsx` | Minimal text links: "Discord · GitHub · Ko-fi" |
| Buttons | `CtaButtons.tsx` | Secondary button row with icons |
| Cards | `CtaCards.tsx` | Styled cards with short descriptions |
| Banner | `CtaBanner.tsx` | Full-width highlight banner with message |
| Sticky | `CtaSticky.tsx` | Fixed bar at bottom of scroll area |
| Inline | `CtaInline.tsx` | Embedded after last changelog item |

Each variant is a self-contained component. The active variant is controlled by local state in `ChangelogModal`.

## Debug Panel

Floating panel for local testing, activated via console:

```js
globalThis.CHANGELOG_CTA_DEBUG = true
```

Renders alongside the modal when flag is set. Radio buttons switch between CTA variants in real-time. No persistence — state resets on reload.

```
┌─────────────────────────────┐
│ CTA Variant            [X]  │
├─────────────────────────────┤
│ ○ Subtle                    │
│ ○ Buttons                   │
│ ● Cards                     │
│ ○ Banner                    │
│ ○ Sticky                    │
│ ○ Inline                    │
└─────────────────────────────┘
```

## File Structure

```
src/lib/overlays/modals/
├── ChangelogModal.tsx
├── ChangelogModal.module.css
└── changelogCta/
    ├── index.ts
    ├── CtaSubtle.tsx
    ├── CtaButtons.tsx
    ├── CtaCards.tsx
    ├── CtaBanner.tsx
    ├── CtaSticky.tsx
    ├── CtaInline.tsx
    ├── ChangelogCtaDebugPanel.tsx
    └── changelogCta.module.css
```

## Integration Changes

| File | Change |
|------|--------|
| `src/lib/hooks/useOpenClose.ts` | Add `CHANGELOG_MODAL` to `OpenCloseIDs` enum |
| `src/lib/overlays/GlobalModals.tsx` | Add `<ChangelogModal />` |
| `src/lib/interactions/notifications.tsx` | Replace toast with `setOpen(OpenCloseIDs.CHANGELOG_MODAL)` |

## Dependencies

- Reuses `getChangelogContent()` from `changelogData.ts`
- Reuses image rendering pattern from `ChangelogTab.tsx`
- Uses `Assets.getChangelog()` for images
- Standard Mantine components (Modal, Button, Flex, ScrollArea)

## i18n

Add keys to `public/locales/*/modals.yaml`:

```yaml
Changelog:
  Title: "Update {{date}}"
  Dismiss: "Got it"
  Cta:
    JoinDiscord: "Join the Discord"
    StarGithub: "Star on GitHub"
    Support: "Support on Ko-fi"
    CommunityLinks: "Join the community"
    # Additional keys per variant as needed
```

## Out of Scope

- Analytics/tracking for CTA clicks (can add later)
- Persisting CTA variant choice (local testing only)
- Showing multiple changelog entries (only latest)
- "Don't show again" option
