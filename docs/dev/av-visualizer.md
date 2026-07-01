# AV Visualizer Tab

A tab dedicated to visualizing Action Value (AV) and turn order for up to 4 characters, with support for
modeling speed buffs/debuffs and AV-pulling effects ("interventions") over the timeline. The core formula is
`AV = 10000 / speed`; lower AV means the character acts sooner.

## File layout

```
src/lib/tabs/tabAvVisualizer/
  AvVisualizerTab.tsx              Root component: slot cards + intervention sidebar + Timeline
  avVisualTabController.ts         Thin wrapper around the store + simulation engine + row-size math
  useAVVisualTabStore.ts           Zustand store (slots, rowCount, interventions, mocFirstRow)
  types.ts                         Intervention / SimEvent types
  constants.ts                     Layout constants (ROW_SIZE, avatar size, slot colors, ...)
  simulation/
    simulateTimeline.ts            Discrete-event AV simulation engine
  timeline/
    Timeline.tsx                   Renders rows, owns the simulate() call, holds panel-open state
    TimelineRow.tsx                One row: ruler, ticks, markers, click-to-snap + hover preview
    ActionMarker.tsx                Character avatar marker (+ multi-action count badge)
    InterventionMarker.tsx         Gold circle marker for interventions on the ruler
  interventionPanel/
    InterventionListPanel.tsx      Modal: per-action grouped list (left) + add/edit form (right)
    InterventionItem.tsx           One row in the list (type icon, value, targets, edit/delete)
    ActionOrderAvatar.tsx          Small avatar used in the panel's action-order row
  characterSlotCard/
    CharacterSlotCard.tsx          Character picker + SPD override per slot
```

## Data source

Character speed is read from `characterStore` (populated after the user imports their save). Final (panel)
speed = base speed from `game_data.json` + relic speed substats — the same value shown in the Showcase tab.
The white value (base speed, no relics) is read separately and used for percent-based speed buff math. Each
slot also supports a manual SPD override.

## Simulation engine (`simulateTimeline.ts`)

A discrete-event simulation over a continuous AV axis. Characters are stored in a priority queue keyed by their
next action AV; the engine repeatedly pops the soonest action, records it, and re-enqueues the character at
`AV + 10000/effectiveSpd`.

### Intervention types

- `spd_up` / `spd_down` — flat or percent (percent of white value) SPD buff/debuff with a turn-based duration
- `av_advance` / `av_delay` — flat or percent (percent of the target's max action interval) AV shift;
  `av_advance` is clamped so the target can never be pulled earlier than the intervention's `triggerAv`

### Timing model

Every intervention fires relative to a specific point in the timeline:

- **During action** (`beforeCharId` + `beforeActionIndex`) — fires immediately before the target character's
  Nth action. A buff applied here with `durationTurns=1` is fully consumed by that very action (no observable
  effect at all); `durationTurns=N` leaves `N-1` turns active afterward.
- **End-of-action instant** (`afterCharId` + `afterActionIndex`) — fires immediately after the target
  character's Nth action ends, once it has been re-enqueued. Effects here apply via gauge conservation (see
  below) and always provide the full `durationTurns` worth of buffed intervals.
- **Global "during action"** (neither field set) — legacy/flat-view timing: fires once when the timeline reaches
  `triggerAv`, independent of any specific character. Used for interventions added when no character happens to
  act at that exact AV.

`beforeActionIndex` / `afterActionIndex` default to `0` (the character's first action) when unset. Each
intervention is bound to an exact `(characterId, triggerAv, actionIndex)` triple, so it fires exactly once even
if the character is pulled to act multiple times at the same AV (e.g. a chain of `av_advance` 100% effects).

### Gauge conservation

When a speed buff/debuff applies mid-cycle (not exactly at the target's current action AV), the target's next
action AV is recalculated to conserve "gauge distance" rather than just shifting by a flat amount:

```
gaugeDistance = remainingAV × oldSpd
newRemainingAV = gaugeDistance / newSpd
newAV = triggerAv + newRemainingAV
```

### Same-AV ordering

When multiple characters land on the exact same AV, natural ties are broken by stable insertion order. When a
character is pulled onto another's AV via `av_advance`, the engine records its pre-pull AV (`originalAv`); among
characters sharing an AV, the one whose `originalAv` is closer to that AV acts first.

## Memory of Chaos mode

A toggle (top-right of the first timeline row) that makes the first row span 150 AV instead of 100, matching the
in-game first-cycle mechanic. Implemented purely as a display/row-chunking concern —
`AvVisualTabController.getRowStart/getRowSize/getTotalAv(rowIndex, mocFirstRow)` compute row boundaries; the
simulation engine itself only ever sees a continuous AV value and `totalAv`. The toggle is session-only state
(not persisted across reloads), consistent with `rowCount` and `interventions`.

## Intervention panel UI

Clicking an avatar marker, an intervention marker, or empty ruler space opens `InterventionListPanel`:

- Modal title is the AV value itself, with an inline edit affordance (pencil → input + confirm) to jump to any
  AV without closing the panel
- An action-order row shows, in order, the avatar of every character action at that AV (multiple avatars if a
  character acts more than once there)
- The list is split per action into two zones with identical structure for every action instance: a bordered
  container for "during action" interventions, and an area below it for "end-of-action instant" interventions —
  each with its own add button
- Add/edit opens a form in the right-hand column (list stays visible on the left); the type selector uses a
  small icon convention also shown in `InterventionItem` rows: ↑ speed up, ↓ speed down, ← advance, → delay

Clicking the ruler snaps to the nearest whole AV (a small dot previews the snap target on hover) rather than the
exact pixel-mapped decimal, since most interventions are added at integer AVs; a decimal AV can still be entered
manually via the title's edit field.

## Persistence

Only `savedSession` (character slots + SPD overrides) is written to the global save file (see `saveState.ts`).
`rowCount`, `interventions`, and `mocFirstRow` are session-only and reset on reload.

## i18n

All user-facing strings live in the `avVisualizerTab` namespace
(`public/locales/{lng}/avVisualizerTab.yaml`, currently `zh_CN` and `en_US`). After editing either file, run
`npm run update-resources` to regenerate `src/types/resources.d.ts`.

## Tests

`simulation/simulateTimeline.test.ts` and `useAVVisualTabStore.test.ts` cover the engine and store. Run with
`npx vitest run src/lib/tabs/tabAvVisualizer`.
