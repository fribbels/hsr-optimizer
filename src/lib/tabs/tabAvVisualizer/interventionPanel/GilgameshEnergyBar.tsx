import type { CharacterEnergyBarProps } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { EnergyBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'

// Matches Gilgamesh.ts's own 本王允许你进攻 (extraAttack) counter — kept as a plain literal here since
// this is a display-only component, not part of the battle simulation itself.
const PERMISSION_TO_STRIKE_ID = 'gilgamesh_permission_to_strike'
const MAX_HITS = 8

// Gilgamesh's energy bar is the regular one — the only addition is a row of 8 fixed slots below it
// tracking 本王允许你进攻's accumulated hit count (shared between his own and Saber's attacks), lit up
// one per stack held. Unlike Huohuo's Rangming slots (which track remaining turns and whose count itself
// shifts with E1), this is always exactly 8 — the extraAttack always needs the full 8 hits regardless of
// eidolon.
export function GilgameshEnergyBar({ activeInterventions, ...props }: CharacterEnergyBarProps) {
  const stacks = activeInterventions?.find((b) => b.effectId === PERMISSION_TO_STRIKE_ID)?.stacks ?? 0
  const lit = Math.min(MAX_HITS, Math.max(0, stacks))

  return (
    <div style={{ minWidth: 0 }}>
      <EnergyBar {...props} />
      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
        {Array.from({ length: MAX_HITS }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < lit ? props.color : 'var(--mantine-color-dark-4)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
