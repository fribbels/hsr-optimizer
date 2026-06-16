# AV Visualizer Tab — Feature Design

## Overview

A new tab dedicated to visualizing Action Value (AV) and turn order for up to 4 characters. The core formula is `AV = 10000 / speed`. Users can see exactly when each character acts within a given AV range, making team speed tuning intuitive.

## Data Source

Character speed is read from `characterStore` (populated after the user imports their save file). Final speed = base speed from `game_data.json` + relic speed substats from equipped relics. This is the same value shown in the Showcase tab — no manual input needed.

Flow: select character → read from `characterStore` → compute final speed → place on AV axis.

## UI Layout

- The main area is a horizontal AV timeline divided into rows
- Each row represents 100 AV
- Default display: 3 rows (0–300 AV)
- A full-width "+" button below the last row lets users add more rows (100 AV each)
- Up to 4 characters can be selected; each gets a distinct color
- Each character's action markers appear at `AV = 10000 / speed`, then repeat at the same interval, spanning across rows as needed

## Development Phases

### Phase 1 — Pure Speed (current target)
- Select up to 4 characters from the roster
- Read final speed from character store
- Render action markers on the AV timeline based solely on speed
- No skills, no buffs, no relics effects

### Phase 2 — Skill Effects
- Model pull-forward (行动推进), speed buffs, and speed debuffs
- Requires a simple AV simulation engine that mutates character AV mid-timeline

### Phase 3 — Relic Effects
- Apply speed bonuses from relevant relic sets (e.g. Hackerspace)
- Small number of sets currently have speed-related effects

### Future Phases (not in scope yet)
- Skill point economy
- Energy and ultimate timing
- Follow-up attacks
- Damage summary per window
- Enemy turn order and ability timings (pending data availability)

## Notes

- Simulation scope is AV-based, not round-based
- Enemies are out of scope until data is available
- Phase 1 can be built independently; later phases layer on top without restructuring the core UI
